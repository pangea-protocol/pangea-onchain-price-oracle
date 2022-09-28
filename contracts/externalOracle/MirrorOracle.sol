// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "../interfaces/IExternalOracle.sol";
import "../interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @notice Mirror Price Oracle, used for bridging assets
contract MirrorOracle is IExternalOracle, OwnableUpgradeable {

    uint8 public constant DECIMALS = 6;

    mapping(address=>address) public mirrorFrom;
    IPriceOracle private oracle;

    function initialize(address _priceOracle) external initializer {
        oracle = IPriceOracle(_priceOracle);
        __Ownable_init();
    }

    // @notice register mirror token
    // @param token
    // @param sourceToken
    function register(address token, address sourceToken) external onlyOwner {
        mirrorFrom[token] = sourceToken;
    }

    /// @notice consult token price
    function consultPrice(address token) external view returns (uint256 price) {
        if (mirrorFrom[token] == address(0)) return 0;
        return oracle.consultPrice(mirrorFrom[token]);
    }
}
