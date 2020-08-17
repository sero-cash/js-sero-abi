var serojs = require("../lib/index")


var abi = [
    {
        "inputs": [],
        "name": "unpay",
        "outputs": [
            {
                "internalType": "string",
                "name": "merchantKey",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "payNo",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "code",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "modelAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

var address = "rT3B9jQwvisK2Hha2ZFfvXcvcgGUJ9y9LiREiB5Ukbd9bSbnsrBKfVvDvqHutiAw1jPzEXnYpoHqP1EpDq9Ysmy";


var callContract = serojs.callContract(abi, address)

// var callData1 = callContract.count();
//
// var callData2 = callContract.packData("transferFrom", ["2HWZYGNAQDeL8MWXn5akm4XCK6SoBGbynq9DRC9fCwDKTd3edxuovEob1rFeKVdF82YdDaZ434qGFfk5bZjsaha5Dx7jibw7eRjLTmrUHJdf6t3HTkMRSZxpJ6dU7xNLZKfc", "2HWZYGNAQDeL8MWXn5akm4XCK6SoBGbynq9DRC9fCwDKTd3edxuovEob1rFeKVdF82YdDaZ434qGFfk5bZjsaha5Dx7jibw7eRjLTmrUHJdf6t3HTkMRSZxpJ6dU7xNLZKfc", "0x2ce"])
//
// // console.log(callData1);
//
// console.log(callData2)
//
//
// var callData3 = callContract.packData("transferFrom", ["2HWZYGNAQDeL8MWXn5akm4XCK6SoBGbynq9DRC9fCwDKTd3edxuovEob1rFeKVdF82YdDaZ434qGFfk5bZjsaha5Dx7jibw7eRjLTmrUHJdf6t3HTkMRSZxpJ6dU7xNLZKfc", "2HWZYGNAQDeL8MWXn5akm4XCK6SoBGbynq9DRC9fCwDKTd3edxuovEob1rFeKVdF82YdDaZ434qGFfk5bZjsaha5Dx7jibw7eRjLTmrUHJdf6t3HTkMRSZxpJ6dU7xNLZKfc", "0x2ce"],true)
//
// console.log(callData3)

console.log(callContract.unPackDataEx("unpay", "0x0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000001d6562992aa00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000007881ad32aed3af15be6e6245a30281576cf9046b00000000000000000000000000000000000000000000000000000000000000095a4853484f505f34310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4b4d52453249425655534b4b4200000000000000000000000000000000000000"));




//serojs pack的结果，执行报错
// 0x8eb38defa2b1336f2001c826c3c751530002d84c9ef048800260c8a40deb6a7a6906aedeb98afaed69cbea26a4a3d9bece83f9232993dd7d169ccefcdd246a83922591e3af5ae53288e61e2a4d543d70580ca03a84604438ee0109b15184d856275b9e4785834b4f84ee5954fabdca167e57807b10d9333acfaba3fe4e76f37117231e3a3d33158f4eee9af763cb835aa68513392579cf3f99b60584a7d88e27d6b9f1bc99cbd5571dfb2132e1c9d4eadc0c23b872dd00000000000000000000000024318f2e0209e6477b2d2579d1128adc5fe9eec5000000000000000000000000143f441e9143bdabb650e695c1bd9d2182148c7500000000000000000000000000000000000000000000000000000000000002ce

//gero packmethod的结果，可以执行
// 0x8eb38defa2b1336f2001c826c3c751530002d84c9ef048800260c8a40deb6a7a6906aedeb98afaed69cbea26a4a3d9bece83f9232993dd7d169ccefcdd246a83922591e3af5ae53288e61e2a4d543d70580ca03a84604438ee0109b15184d856275b9e4785834b4f84ee5954fabdca167e5725a680186d5794c4eed5f1753ba206f221b6d305094466051b7343aadb917d13d57ac15e2e2eb762c0edd6963e4f765242e4ee748892ab276402dbc359c1150810d82dd0c7b6dbbbb1a452fc08bd28c330c03914c40e76cc108fd4b3daf2dca923b872dd00000000000000000000000024318f2e0209e6477b2d2579d1128adc5fe9eec500000000000000000000000022b4d0b76055b82c69ae43942cce8e777f2c5a3800000000000000000000000000000000000000000000000000000000000002ce

