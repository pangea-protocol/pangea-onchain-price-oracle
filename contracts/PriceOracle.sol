// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "./libraries/FullMath.sol";
import "./interfaces/IPairReserve.sol";
import "./interfaces/IExternalOracle.sol";
import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IPriceOracleError.sol";

contract PriceOracle is IPriceOracle, IPriceOracleError, OwnableUpgradeable {

    uint256 public constant DECIMAL = 6;

    mapping(address => bool) public isPairReserve;
    address[] public pairReserves;

    mapping(address => bool) public isBaseToken;
    address[] public baseTokens;

    mapping(address => address) public tokenPriceOracles;

    function initialize() external initializer {
        __Ownable_init();
    }

    // ============ ONLY ADMIN ==================
    function registerPairReserve(address _pairReserve) external onlyOwner {
        if (_pairReserve == address(0)) revert ZERO_ADDRESS();
        if (isPairReserve[_pairReserve]) revert ALREADY_REGISTERED();

        isPairReserve[_pairReserve] = true;
        pairReserves.push(_pairReserve);
    }

    function registerTokenOracle(address _token, address _priceOracle) external onlyOwner {
        if (_priceOracle == address(0)) revert ZERO_ADDRESS();

        tokenPriceOracles[_token] = _priceOracle;
    }

    function unRegisterTokenOracle(address _token) external onlyOwner {
        tokenPriceOracles[_token] = address(0);
    }

    function registerBaseToken(address token) external onlyOwner {
        if (tokenPriceOracles[token] == address(0)) revert NOT_REGISTERED_ORACLE();
        if (isBaseToken[token]) revert ALREADY_REGISTERED();
        isBaseToken[token] = true;
        baseTokens.push(token);
    }

    function unRegisterBaseToken(address token) external onlyOwner {
        if (!isBaseToken[token]) revert NOT_REGISTERED();
        isBaseToken[token] = false;

        for (uint256 i = 0; i < baseTokens.length - 1; i++) {
            address baseToken = baseTokens[i];
            if (baseToken == token) {
                baseTokens[i] = baseTokens[baseTokens.length - 1];
                break;
            }
        }

        baseTokens.pop();
    }

    // ============= ON CHAIN ORACLE LOGIC ===============
    function consultKlayPrice() external view returns (uint256 price) {
        return IExternalOracle(tokenPriceOracles[address(0)]).consultPrice(address(0));
    }

    function consultPrice(address token) external view returns (uint256 price) {
        address _priceOracle = tokenPriceOracles[token];

        if (_priceOracle != address(0)) {
            return IExternalOracle(_priceOracle).consultPrice(token);
        } else {
            return evaluateDerivedTokenPrice(token, baseTokens);
        }
    }

    function consultPriceFrom(address token, address[] memory referenceTokens) external view returns (uint256 price) {
        return evaluateDerivedTokenPrice(token, referenceTokens);
    }

    function evaluateDerivedTokenPrice(address derivedToken, address[] memory _baseTokens) internal view returns (uint256 price) {
        (uint256 dollarReserve, uint256 tokenReserve) = dollarPairReserve(derivedToken, _baseTokens);
        if (dollarReserve == 0 || tokenReserve == 0) return 0;

        uint256 tokenDecimal = IERC20Metadata(derivedToken).decimals();
        if (tokenDecimal < 18) {
            return FullMath.mulDiv(dollarReserve, 10 ** DECIMAL, tokenReserve * 10 ** (18 - tokenDecimal));
        } else {
            return FullMath.mulDiv(dollarReserve, 10 ** (DECIMAL + tokenDecimal - 18), tokenReserve);
        }
    }

    function dollarPairReserve(
        address token,
        address[] memory _baseTokens
    ) private view returns (uint256 dollarReserve, uint256 tokenReserve) {
        for (uint256 i = 0; i < _baseTokens.length; i++) {
            address _baseToken = _baseTokens[i];
            (uint256 _baseReserve, uint256 _tokenReserve) = aggregateReserves(_baseToken, token);

            // Convert the total reserves of baseToken in dollars
            dollarReserve += adjustBaseReserveToDollarReserve(_baseToken, _baseReserve);
            tokenReserve += _tokenReserve;
        }
    }

    function aggregateReserves(
        address token0,
        address token1
    ) private view returns (uint256 reserve0, uint256 reserve1) {
        for (uint256 i = 0; i < pairReserves.length; i++) {
            address pairReserve = pairReserves[i];
            (uint256 _pairReserve0, uint256 _pairReserve1) = IPairReserve(pairReserve).getReserve(token0, token1);
            reserve0 += _pairReserve0;
            reserve1 += _pairReserve1;
        }
    }

    function adjustBaseReserveToDollarReserve(
        address baseToken,
        uint256 amount
    ) internal view returns (uint256) {
        uint8 decimals = baseToken == address(0) ? 18 : IERC20Metadata(baseToken).decimals();
        uint256 price = IExternalOracle(tokenPriceOracles[baseToken]).consultPrice(baseToken);
        if (decimals > 18) {
            return FullMath.mulDiv(amount, price, 10 ** (decimals - 18 + DECIMAL));
        } else {
            return FullMath.mulDiv(amount, price * 10 ** (18 - decimals), 10 ** DECIMAL);
        }
    }
}
