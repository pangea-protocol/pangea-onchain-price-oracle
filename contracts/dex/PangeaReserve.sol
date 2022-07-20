// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "../libraries/FullMath.sol";
import "../interfaces/IPairReserve.sol";
import "../interfaces/pangea/IConcentratedLiquidityPool.sol";
import "../interfaces/pangea/IConcentratedLiquidityPoolFactory.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract PangeaReserve is IPairReserve, Initializable {

    IConcentratedLiquidityPoolFactory public factory;
    address private wklay;

    function initialize(address _factory, address _wklay) external initializer {
        factory = IConcentratedLiquidityPoolFactory(_factory);
        wklay = _wklay;
    }

    function WKLAY() external view returns (address) {
        return wklay;
    }

    function getReserve(address token0, address token1) external view returns (uint256 reserve0, uint256 reserve1) {
        return _getReserve(token0, token1);
    }

    function getKlayReserve(address token) external view returns (uint256 klayReserve, uint256 tokenReserve) {
        return _getReserve(wklay, token);
    }

    function _getReserve(address token0, address token1) internal view returns (uint256 reserve0, uint256 reserve1) {
        address[] memory pools = factory.getPools(token0, token1, 0, factory.poolsCount(token0, token1));

        for (uint256 i = 0; i < pools.length; i++) {
            IConcentratedLiquidityPool pool = IConcentratedLiquidityPool(pools[i]);
            uint256 price = pool.price();
            uint256 liquidity = pool.liquidity();
            if (pool.token0() == token0) {
                reserve0 += FullMath.mulDiv(liquidity, 0x1000000000000000000000000, price);
                reserve1 += FullMath.mulDiv(liquidity, price, 0x1000000000000000000000000);
            } else {
                reserve0 += FullMath.mulDiv(liquidity, price, 0x1000000000000000000000000);
                reserve1 += FullMath.mulDiv(liquidity, 0x1000000000000000000000000, price);
            }
        }
    }
}
