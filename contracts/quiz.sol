// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OnChainOlympics {
    struct Competition {
        uint256 id;
        string competitionType;

        // 문제/정답 해시
        string problem;
        bytes32 answerHash;

        uint256 startTime;
        uint256 endTime;
        uint256 entryFee;
        uint256 totalPrizePool;
        uint256 participantCount;
        bool isActive;

        // 참가 여부
        mapping(address => bool) hasJoined;

        // 점수(0/1) - 정답 여부
        mapping(address => uint256) scores;

        // 정답을 '처음' 맞춘 시각(빠른 순 정렬용)
        mapping(address => uint256) firstCorrectAt;

        address[] participants;
    }

    struct LeaderboardEntry {
        address player;
        uint256 score;      // 0 or 1
        uint256 reward;
    }

    uint256 public competitionCounter;
    mapping(uint256 => Competition) public competitions;
    mapping(address => uint256) public playerBalances;
    mapping(address => uint256) public totalWins;
    mapping(string => uint256) public countryScores; // (미사용)

    uint256 public constant COMPETITION_DURATION = 60; // 60 seconds
    uint256 public constant ENTRY_FEE = 1 * 10**15;
    uint256 public constant PLATFORM_FEE_PERCENT = 10;

    event CompetitionCreated(uint256 indexed competitionId, string competitionType, uint256 startTime);
    event PlayerJoined(uint256 indexed competitionId, address indexed player);
    event ScoreSubmitted(uint256 indexed competitionId, address indexed player, uint256 score);
    event CompetitionEnded(uint256 indexed competitionId, uint256 totalRewards);
    event RewardClaimed(address indexed player, uint256 amount);

    modifier onlyActiveCompetition(uint256 _competitionId) {
        require(competitions[_competitionId].isActive, "Competition not active");
        require(block.timestamp <= competitions[_competitionId].endTime, "Competition ended");
        _;
    }

    // 문제 생성
    function createCompetition(
        string memory _competitionType,
        string memory _problem,
        string memory _answer
    ) external returns (uint256) {
        competitionCounter++;

        Competition storage newComp = competitions[competitionCounter];
        newComp.id = competitionCounter;
        newComp.competitionType = _competitionType;

        // 문제/정답 해시 저장
        newComp.problem = _problem;
        newComp.answerHash = keccak256(abi.encode(_problem, _answer));

        newComp.startTime = block.timestamp + 45; // 45 second delay
        newComp.endTime = block.timestamp + 45 + COMPETITION_DURATION;
        newComp.entryFee = ENTRY_FEE;
        newComp.isActive = true;

        emit CompetitionCreated(competitionCounter, _competitionType, newComp.startTime);
        return competitionCounter;
    }

    function joinCompetition(uint256 _competitionId) external payable onlyActiveCompetition(_competitionId) {
        Competition storage comp = competitions[_competitionId];

        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(!comp.hasJoined[msg.sender], "Already joined");

        comp.hasJoined[msg.sender] = true;
        comp.participants.push(msg.sender);
        comp.totalPrizePool += msg.value;
        comp.participantCount++;

        emit PlayerJoined(_competitionId, msg.sender);
    }

    // 정답 제출: 정답이면 score=1, 아니면 score=0
    // 빠른 순 정렬을 위해 '처음으로 정답을 맞춘 시각'을 기록
    function submitScore(
        uint256 _competitionId,
        string memory _answer
    ) external onlyActiveCompetition(_competitionId) {
        Competition storage comp = competitions[_competitionId];
        require(comp.hasJoined[msg.sender], "Not joined");

        // 정답 검증
        bytes32 h = keccak256(abi.encode(comp.problem, _answer));
        bool correct = (h == comp.answerHash);

        if (correct) {
            // 정답 처리
            if (comp.scores[msg.sender] == 0) {
                // 처음으로 정답을 맞춘 순간만 기록
                comp.scores[msg.sender] = 1;
                if (comp.firstCorrectAt[msg.sender] == 0) {
                    comp.firstCorrectAt[msg.sender] = block.timestamp;
                }
            }
        } else {
            // 오답이면 현재 스코어를 0으로 (마지막 상태 기준)
            comp.scores[msg.sender] = 0;
            // firstCorrectAt은 지우지 않음(최초 정답 시각 보존).
            // 최종 보상 대상은 "현재 score=1"인 사용자만 됨.
        }

        emit ScoreSubmitted(_competitionId, msg.sender, comp.scores[msg.sender]);
    }

    function endCompetition(uint256 _competitionId) external {
        Competition storage comp = competitions[_competitionId];
        require(comp.isActive, "Competition already ended");
        require(block.timestamp > comp.endTime, "Competition still running");

        comp.isActive = false;

        if (comp.participantCount > 0) {
            uint256 platformFee = (comp.totalPrizePool * PLATFORM_FEE_PERCENT) / 100;
            uint256 rewardPool = comp.totalPrizePool - platformFee;

            // 정답자만 모아서 'firstCorrectAt' 오름차순(빠른 순) 정렬
            address[] memory corrects = _collectCorrectParticipants(_competitionId);
            _sortByFirstCorrectAtAsc(_competitionId, corrects);

            uint256 correctCount = corrects.length;
            if (correctCount > 0 && rewardPool > 0) {
                uint256 winnersCount = (correctCount * 10) / 100; // 상위 10%
                if (winnersCount == 0) winnersCount = 1;
                if (winnersCount > correctCount) winnersCount = correctCount;

                for (uint256 i = 0; i < winnersCount; i++) {
                    address winner = corrects[i]; // 가장 빨랐던 순
                    uint256 reward = calculateReward(rewardPool, i, winnersCount);
                    playerBalances[winner] += reward;
                    totalWins[winner]++;
                }
            }
        }

        emit CompetitionEnded(_competitionId, comp.totalPrizePool);
    }

    // (참고용) 기존 리더보드 형태 유지: 참가자 score만 내려줌(정렬 없이)
    function getLeaderboard(uint256 _competitionId) public view returns (LeaderboardEntry[] memory) {
        Competition storage comp = competitions[_competitionId];
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](comp.participantCount);

        for (uint256 i = 0; i < comp.participantCount; i++) {
            address p = comp.participants[i];
            entries[i] = LeaderboardEntry({ player: p, score: comp.scores[p], reward: 0 });
        }
        return entries;
    }

    // === 내부 유틸 ===

    // 정답자 목록 수집
    function _collectCorrectParticipants(uint256 _competitionId) internal view returns (address[] memory) {
        Competition storage comp = competitions[_competitionId];

        // 먼저 개수 셈
        uint256 count;
        for (uint256 i = 0; i < comp.participantCount; i++) {
            address p = comp.participants[i];
            if (comp.scores[p] == 1 && comp.firstCorrectAt[p] != 0) {
                count++;
            }
        }

        // 배열 채우기
        address[] memory arr = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < comp.participantCount; i++) {
            address p = comp.participants[i];
            if (comp.scores[p] == 1 && comp.firstCorrectAt[p] != 0) {
                arr[idx++] = p;
            }
        }
        return arr;
    }

    // firstCorrectAt 기준 오름차순(빠른 순) 버블 정렬 (데모용)
    function _sortByFirstCorrectAtAsc(uint256 _competitionId, address[] memory arr) internal view {
        Competition storage comp = competitions[_competitionId];
        uint256 n = arr.length;
        for (uint256 i = 0; i < n; i++) {
            for (uint256 j = i + 1; j < n; j++) {
                if (comp.firstCorrectAt[arr[j]] < comp.firstCorrectAt[arr[i]]) {
                    address tmp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tmp;
                }
            }
        }
    }

    function calculateReward(uint256 _rewardPool, uint256 _rank, uint256 _winnersCount)
        internal
        pure
        returns (uint256)
    {
        // 상위일수록 가중치 큼 (랭크 0이 최상위)
        uint256 weight = _winnersCount - _rank;
        uint256 totalWeight = (_winnersCount * (_winnersCount + 1)) / 2;
        return (_rewardPool * weight) / totalWeight;
    }

    function claimRewards() external {
        uint256 balance = playerBalances[msg.sender];
        require(balance > 0, "No rewards to claim");

        playerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);

        emit RewardClaimed(msg.sender, balance);
    }

    function getCompetitionDetails(uint256 _competitionId) external view returns (
        string memory competitionType,
        uint256 startTime,
        uint256 endTime,
        uint256 totalPrizePool,
        uint256 participantCount,
        bool isActive
    ) {
        Competition storage comp = competitions[_competitionId];
        return (
            comp.competitionType,
            comp.startTime,
            comp.endTime,
            comp.totalPrizePool,
            comp.participantCount,
            comp.isActive
        );
    }

    function getPlayerScore(uint256 _competitionId, address _player) external view returns (uint256) {
        return competitions[_competitionId].scores[_player];
    }

    receive() external payable {}
}
