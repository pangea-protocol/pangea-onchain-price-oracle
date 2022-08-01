// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "../interfaces/IExternalOracle.sol";
import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @notice Proxy Oracle Contract for Witnet
contract WitnetExternalOracle is IExternalOracle, OwnableUpgradeable {

    IWitnetPriceRouter public witnetPriceRouter;
    uint8 public constant DECIMALS = 6;

    mapping(address=>bytes32) public values;
    mapping(bytes32=>uint8) public decimalsForValue;


    function initialize(address _witnetOracle) external initializer {
        witnetPriceRouter = IWitnetPriceRouter(_witnetOracle);
        __Ownable_init();
    }

    // Calculation
    // >   value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(text));
    //
    // price-KLAY/USD-6 : 0x6cc828d1f864e45b78cb57a1e4ee8b4b413e8404fbe6e4d75d0bfc80b7a4f3ef
    // price-KSP/USD-6  : 0x54a1a0e637c10f1ac6b1e27bf4de2b6fec9cf1786ce47001f38f8b32dad9884f
    // price-USDT/USD-6 : 0x538f5a25b39995a23c24037d2d38f979c8fa7b00d001e897212d936e6f6556ef
    function register(address token, bytes32 value, uint8 decimals) external onlyOwner {
        values[token] = value;
        decimalsForValue[value] = decimals;
    }

    /// @notice consult token price
    function consultPrice(address token) external view returns (uint256 price) {
        bytes32 value = values[token];
        require(value != bytes32(0), "NOT_REGISTERED");
        (int256 iPrice,,) = witnetPriceRouter.valueFor(value);

        price = uint256(iPrice);
        uint8 valueDecimals = decimalsForValue[value];
        if (valueDecimals < DECIMALS) {
            price *= 10 ** (DECIMALS - valueDecimals);
        } else if (valueDecimals > DECIMALS) {
            price /= 10 ** (valueDecimals - DECIMALS);
        }
    }
}
