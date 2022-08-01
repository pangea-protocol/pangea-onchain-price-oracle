// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

interface IPriceOracleError {
    error ALREADY_REGISTERED();

    error NOT_REGISTERED();

    error NOT_REGISTERED_ORACLE();

    error ZERO_ADDRESS();
}
