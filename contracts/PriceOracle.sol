// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "./libraries/FullMath.sol";
import "./interfaces/IPairReserve.sol";
import "./interfaces/IExternalOracle.sol";
import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PriceOracle is IPriceOracle, OwnableUpgradeable {
    uint256 public constant DECIMAL = 6;

    mapping(address => bool) public isPairReserve;
    address[] public pairReserves;

    mapping(address => bool) public isStableCoin;
    address[] public stableCoins;

    mapping(address => bool) public isWklay;
    address[] public wklays;

    address public klayOracle;

    function initialize() external initializer {
        __Ownable_init();
    }

    // ============ ONLY ADMIN ==================
    function registerPairReserve(address _pairReserve) external onlyOwner {
        require(!isPairReserve[_pairReserve], "ALREADY REGISTERED");

        isPairReserve[_pairReserve] = true;
        pairReserves.push(_pairReserve);

        address wklay = IPairReserve(_pairReserve).WKLAY();
        if (!isWklay[wklay]) {
            isWklay[wklay] = true;
            wklays.push(wklay);
        }
    }

    function registerStableCoin(address _stableCoin) external onlyOwner {
        require(!isStableCoin[_stableCoin], "ALREADY REGISTERED");

        isStableCoin[_stableCoin] = true;
        stableCoins.push(_stableCoin);
    }

    function registerKlayOracle(address _klayOracle) external onlyOwner {
        klayOracle = _klayOracle;
    }

    // ============= ON CHAIN ORACLE LOGIC ===============
    function consultKlayPrice() external view returns (uint256 price) {
        return _klayPriceFromOracle();
    }

    function consultPrice(address token) external view returns (uint256 price) {
        for (uint256 i = 0; i < stableCoins.length; i++) {
            if (stableCoins[i] == token) return 10 ** DECIMAL;
        }

        for (uint256 i = 0; i < wklays.length; i++) {
            if (token == wklays[i]) return _klayPriceFromOracle();
        }

        return _consultPriceFrom(token, address(0));
    }

    function consultPriceFrom(address token, address referenceToken) external view returns (uint256 price) {
        return _consultPriceFrom(token, referenceToken);
    }

    function _consultPriceFrom(address token, address referenceToken) internal view returns (uint256 price) {
        (uint256 stableReserve, uint256 tokenReserve) = aggregateStablePairReserve(token);

        if (referenceToken == address(0)) {
            (uint256 klayReserve, uint256 tokenReserveOnKlayPool) = aggregateKlayPairReserve(token);
            stableReserve += FullMath.mulDiv(klayReserve, _klayPriceFromOracle(), 10 ** DECIMAL);
            tokenReserve += tokenReserveOnKlayPool;
        } else {
            (uint256 referenceReserve, uint256 tokenReserveOnReferencePool) = aggregatePairReserve(referenceToken, token);
            stableReserve += FullMath.mulDiv(referenceReserve, _consultPriceFrom(referenceToken, address(0)), 10 ** DECIMAL);
            tokenReserve += tokenReserveOnReferencePool;
        }

        if (stableReserve == 0 || tokenReserve == 0) {
            return 0;
        }

        uint256 tokenDecimal = IERC20Metadata(token).decimals();
        if (tokenDecimal < 18) {
            return FullMath.mulDiv(stableReserve, 10 ** DECIMAL, tokenReserve * 10 ** (18 - tokenDecimal));
        } else {
            return FullMath.mulDiv(stableReserve, 10 ** (DECIMAL + tokenDecimal - 18), tokenReserve);
        }
    }

    function _klayPriceFromOracle() internal view returns (uint256 price) {
        return IExternalOracle(klayOracle).consultKlayPrice();
    }

    function aggregateStablePairReserve(address token) private view returns (uint256 stableReserve, uint256 tokenReserve) {
        for (uint256 i = 0; i < stableCoins.length; i++) {
            address stableCoin = stableCoins[i];
            (uint256 _stableReserve, uint256 _tokenReserve) = aggregatePairReserve(stableCoin, token);
            stableReserve += adjustDecimal(stableCoin, _stableReserve);
            tokenReserve += _tokenReserve;
        }
    }

    function aggregatePairReserve(address token0, address token1) private view returns (uint256 reserve0, uint256 reserve1) {
        for (uint256 i = 0; i < pairReserves.length; i++) {
            address pairReserve = pairReserves[i];
            (uint256 _pairReserve0, uint256 _pairReserve1) = IPairReserve(pairReserve).getReserve(token0, token1);
            reserve0 += _pairReserve0;
            reserve1 += _pairReserve1;
        }
    }

    function aggregateKlayPairReserve(address token) private view returns (uint256 klayReserve, uint256 tokenReserve) {
        for (uint256 i = 0; i < pairReserves.length; i++) {
            address pairReserve = pairReserves[i];
            (uint256 _klayReserve, uint256 _tokenReserve) = IPairReserve(pairReserve).getKlayReserve(token);
            klayReserve += _klayReserve;
            tokenReserve += _tokenReserve;
        }
    }

    function adjustDecimal(address token, uint256 amount) internal view returns (uint256) {
        return amount * 10 ** (18 - IERC20Metadata(token).decimals());
    }
}
