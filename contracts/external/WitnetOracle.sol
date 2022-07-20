// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "../interfaces/IExternalOracle.sol";
import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract WitnetOracle is IExternalOracle, Initializable {

    IWitnetPriceRouter public witnetPriceRouter;

    function initialize(address _witnetOracle) external initializer {
        witnetPriceRouter = IWitnetPriceRouter(_witnetOracle);
    }

    function consultKlayPrice() external view returns (uint256 price) {
        (int256 iPrice,,) = witnetPriceRouter.valueFor(0x5d9add33a579dcae4103453b8445b350aa99013a7863d73770cd7c135b2c47a0);
        price = uint256(iPrice);
    }
}
