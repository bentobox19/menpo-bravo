# Incident Draft


## Report

### Description



### Date Published

01/Oct/22

### Links


### Estimated Loss

28900000

### Notes

$28.9M were lost according to Transit Finance. However, $18.9M were promptly returned after the discovery of attacker’s multiple transactions with centralized exchanges. One of the attacker’s transactions was also front-run for $1M by an MEV bot.

Though the vulnerability was in the project’s code, this attack targeted the users directly via a vulnerability in the use of the transferFrom() function. Any tokens approved for trading on Transit Swap could be transferred directly from users’ wallets to the unknown exploiter’s address.

Root cause of this attack: a controllable `transferFrom()` external call


```
20221002 Transit Swap - Incorrect owner address validation
Testing

forge test --contracts src/test/TransitSwap_exp.sol -vv

Contract
https://github.com/SunWeb3Sec/DeFiHackLabs/blob/main/src/test/TransitSwap_exp.sol

Link reference
https://twitter.com/TransitFinance/status/1576463550557483008

https://twitter.com/1nf0s3cpt/status/1576511552592543745

https://bscscan.com/tx/0x181a7882aac0eab1036eedba25bc95a16e10f61b5df2e99d240a16c334b9b189
```
