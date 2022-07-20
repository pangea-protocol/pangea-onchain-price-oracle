// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

interface IKlayswapFactory {
    function poolExist(address pool) external view returns (bool exists);

    function tokenToPool(address tokenA, address tokenB) external view returns (address pool);

    function name() external view returns (string memory);

    function approve(address _spender, uint256 _value) external returns (bool);

    function balanceOf(address) external view returns (uint256);

    function transfer(address _to, uint256 _value) external returns (bool);

    function createFee() external view returns (uint256);

    function getPoolAddress(uint256 idx) external view returns (address);

    function getAmountData(uint256 si, uint256 ei)
    external
    view
    returns (
        uint256[] memory,
        uint256[] memory,
        uint256[] memory
    );

    function createKlayPool(
        address token,
        uint256 amount,
        uint256 fee
    ) external payable;

    function createKctPool(
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        uint256 fee
    ) external;

    function exchangeKlayPos(
        address token,
        uint256 amount,
        address[] calldata path
    ) external payable;

    function exchangeKctPos(
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        address[] calldata path
    ) external;

    function exchangeKlayNeg(
        address token,
        uint256 amount,
        address[] calldata path
    ) external payable;

    function exchangeKctNeg(
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        address[] calldata path
    ) external;
}
