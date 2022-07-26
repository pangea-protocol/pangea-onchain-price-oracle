// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IKlayswapExchange is IERC20 {
    function name() external view returns (string memory);

    function tokenA() external view returns (address);

    function tokenB() external view returns (address);

    function getCurrentPool() external view returns (uint256, uint256);

    function addKlayLiquidityWithLimit(
        uint256 amount,
        uint256 minAmountA,
        uint256 minAmountB
    ) external payable;

    function grabKlayFromFactory() external payable;

    function decimals() external view returns (uint8);

    function addKlayLiquidity(uint256 amount) external payable;

    function changeMiningRate(uint256 _mining) external;

    function version() external pure returns (string memory);

    function userRewardSum(address) external view returns (uint256);

    function exchangeNeg(address token, uint256 amount) external returns (uint256);

    function mining() external view returns (uint256);

    function changeFee(uint256 _fee) external;

    function miningIndex() external view returns (uint256);

    function symbol() external view returns (string memory);

    function removeLiquidity(uint256 amount) external;

    function addKctLiquidity(uint256 amountA, uint256 amountB) external;

    function lastMined() external view returns (uint256);

    function claimReward() external;

    function estimateNeg(address token, uint256 amount) external view returns (uint256);

    function updateMiningIndex() external;

    function factory() external view returns (address);

    function exchangePos(address token, uint256 amount) external returns (uint256);

    function addKctLiquidityWithLimit(
        uint256 amountA,
        uint256 amountB,
        uint256 minAmountA,
        uint256 minAmountB
    ) external;

    function fee() external view returns (uint256);

    function estimatePos(address token, uint256 amount) external view returns (uint256);

    function userLastIndex(address) external view returns (uint256);

    function initPool(address to) external;

    function removeLiquidityWithLimit(
        uint256 amount,
        uint256 minAmountA,
        uint256 minAmountB
    ) external;
}
