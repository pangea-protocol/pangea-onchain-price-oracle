// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "../interfaces/IPairReserve.sol";
import "../interfaces/uniswap/IUniswapV2Pair.sol";
import "../interfaces/uniswap/IUniswapV2Factory.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UniswapReserve is IPairReserve, Initializable {

    IUniswapV2Factory public factory;
    address private wklay;

    function initialize(address _factory, address _wklay) external initializer {
        factory = IUniswapV2Factory(_factory);
        wklay = _wklay;
    }

    function WKLAY() external view returns (address) {
        return wklay;
    }

    function getReserve(address token0, address token1) external view returns (uint256 reserve0, uint256 reserve1) {
        token0 = token0 == address(0) ? wklay : token0;
        token1 = token1 == address(0) ? wklay : token1;

        address pool = factory.getPair(token0, token1);
        if (pool == address(0)) return (0, 0);
        (uint112 _reserve0, uint112 _reserve1,) = IUniswapV2Pair(pool).getReserves();

        if (IUniswapV2Pair(pool).token0() == token0) {
            return (_reserve0, _reserve1);
        } else {
            return (_reserve1, _reserve0);
        }
    }
}
