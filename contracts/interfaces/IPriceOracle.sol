// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

interface IPriceOracle {
    /// @notice dollar 환산 시 unit, (units = 6)
    /// @dev 예시로 price = 700574인 경우, 0.700574$ 을 의미
    function DECIMAL() external view returns (uint256 decimal);

    /// @notice 클레이의 가격 가져오기 (units : 10 ^ -6 $)
    function consultKlayPrice() external view returns (uint256 price);

    /// @notice 토큰의 price 가져오기 (units : 10 ^ -6 $)
    /// @param token 조회할 토큰의 주소
    /// @dev (클레이 / DAI / USDC / USDT)와의 페어 풀이 하나도 없는 경우, 가격은 0으로 나옵니다
    function consultPrice(address token) external view returns (uint256 price);

    /// @notice referenceToken 가격을 바탕으로 토큰의 price 가져오기 (units : 10 ^ -6 $)
    /// @param token 조회할 토큰의 주소
    /// @dev (클레이 / DAI / USDC / USDT)와의 페어 풀이 하나도 없는 경우, referenceToken과의 페어풀을 바탕으로 가격을 추론합니다
    function consultPriceFrom(address token, address referenceToken) external view returns (uint256 price);
}
