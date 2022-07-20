// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "../interfaces/IPairReserve.sol";
import "../interfaces/klayswap/IKlayswapExchange.sol";
import "../interfaces/klayswap/IKlayswapFactory.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract KlayswapReserve is IPairReserve, Initializable {

    IKlayswapFactory public factory;

    function initialize(address _factory) external initializer {
        factory = IKlayswapFactory(_factory);
    }

    function WKLAY() external pure returns (address) {
        return address(0);
    }

    function getReserve(address token0, address token1) external view returns (uint256 reserve0, uint256 reserve1) {
        return _getReserve(token0, token1);
    }

    function getKlayReserve(address token) external view returns (uint256 klayReserve, uint256 tokenReserve) {
        return _getReserve(address(0), token);
    }

    function _getReserve(address token0, address token1) internal view returns (uint256 reserve0, uint256 reserve1) {
        address pool = factory.tokenToPool(token0, token1);
        if (pool == address(0)) return (0, 0);
        (uint256 _reserve0, uint256 _reserve1) = IKlayswapExchange(pool).getCurrentPool();

        if (IKlayswapExchange(pool).tokenA() == token0) {
            return (_reserve0, _reserve1);
        } else {
            return (_reserve1, _reserve0);
        }
    }
}
