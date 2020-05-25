var serojs = require("../lib/index")


var registers = ["Dy5JuJcr6yJqh2QX3DUrtg3zXsSr56pXdwSagdQ8yioCG2BCGSa4TZybE6HZZHyN1dCW71zXKMFwtxVWJXjcXLqSFN2FtdTMruhz26sCeEXYt7bHwcMG3kzeh6rytATpX1L"];
var registerscode = "CDS" ;
var decimals = 18;
var count = 3 ;
var number = 100 ;
var blockN = 4000 ;
var totalSupply = 42342 ;
var own = "dr2SiyWRwrFiKfZpbCgdEBg7nXzL4bvejEU4PRsRBP95yEQRPhZrvgJWHHKUAgdoXS7PmtKGqbeGWHB3uRKqZmiFJAW46U8iFCfNMfS6r9ieLHfXgQ4jsw88iGXc54rhdz" ;
var  abi = [{"constant":true,"inputs":[],"name":"count","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"registerscode","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"infon","outputs":[{"name":"","type":"address"},{"name":"","type":"address[]"},{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"number","outputs":[{"name":"a","type":"uint32"},{"name":"b","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"own","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"registers","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"blockN","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"addrs","type":"address[]"}],"name":"registers","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"registers","type":"address[]"},{"name":"registerscode","type":"string"},{"name":"decimals","type":"uint8"},{"name":"count","type":"uint16"},{"name":"number","type":"uint32"},{"name":"blockN","type":"uint64"},{"name":"totalSupply","type":"uint256"},{"name":"own","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"registers","type":"address[]"},{"indexed":false,"name":"registerscode","type":"string"},{"indexed":false,"name":"decimals","type":"uint8"},{"indexed":false,"name":"count","type":"uint16"},{"indexed":false,"name":"number","type":"uint32"},{"indexed":false,"name":"blockN","type":"uint64"},{"indexed":false,"name":"totalSupply","type":"uint256"},{"indexed":false,"name":"own","type":"address"}],"name":"constructorEvent","type":"event"}];

var data="0x608060405234801561001057600080fd5b50604051610a3e380380610a3e8339810160409081528151602080840151928401516060850151608086015160a087015160c088015160e089015196890180519099989098019794969395929491939092909161007391600091908b0190610290565b5086516100879060019060208a01906102f5565b5085600260006101000a81548160ff021916908360ff16021790555084600260016101000a81548161ffff021916908361ffff16021790555083600260036101000a81548163ffffffff021916908363ffffffff16021790555082600260076101000a8154816001604060020a0302191690836001604060020a031602179055508160038190555080600460006101000a815481600160a060020a030219169083600160a060020a031602179055507f5d4c6f231ce175a28c0d89b77cb4a74c6a5f61efcc537d422a66c2220c8f8c0388888888888888886040518080602001806020018960ff1660ff1681526020018861ffff1661ffff1681526020018763ffffffff1663ffffffff168152602001866001604060020a03166001604060020a0316815260200185815260200184600160a060020a0316600160a060020a0316815260200183810383528b818151815260200191508051906020019060200280838360005b838110156102055781810151838201526020016101ed565b5050505090500183810382528a818151815260200191508051906020019080838360005b83811015610241578181015183820152602001610229565b50505050905090810190601f16801561026e5780820380516001836020036101000a031916815260200191505b509a505050505050505050505060405180910390a150505050505050506103b0565b8280548282559060005260206000209081019282156102e5579160200282015b828111156102e55782518254600160a060020a031916600160a060020a039091161782556020909201916001909101906102b0565b506102f192915061036f565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061033657805160ff1916838001178555610363565b82800160010185558215610363579182015b82811115610363578251825591602001919060010190610348565b506102f1929150610396565b61039391905b808211156102f1578054600160a060020a0319168155600101610375565b90565b61039391905b808211156102f1576000815560010161039c565b61067f806103bf6000396000f3006080604052600436106100a35763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306661abd81146100a857806318160ddd146100d45780631d44b1c2146100fb578063313ce5671461018557806359593c70146101b05780638381f58a1461023357806399cdee0e14610271578063a0d3d084146102a2578063a52dc2e714610307578063a818131a14610339575b600080fd5b3480156100b457600080fd5b506100bd6103a2565b6040805161ffff9092168252519081900360200190f35b3480156100e057600080fd5b506100e96103b2565b60408051918252519081900360200190f35b34801561010757600080fd5b506101106103b8565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561014a578181015183820152602001610132565b50505050905090810190601f1680156101775780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561019157600080fd5b5061019a61044d565b6040805160ff9092168252519081900360200190f35b3480156101bc57600080fd5b506101c5610456565b60408051600160a060020a038516815260ff8316918101919091526060602080830182815285519284019290925284516080840191868101910280838360005b8381101561021d578181015183820152602001610205565b5050505090500194505050505060405180910390f35b34801561023f57600080fd5b506102486104dd565b6040805163ffffffff909316835267ffffffffffffffff90911660208301528051918290030190f35b34801561027d57600080fd5b50610286610507565b60408051600160a060020a039092168252519081900360200190f35b3480156102ae57600080fd5b506102b7610516565b60408051602080825283518183015283519192839290830191858101910280838360005b838110156102f35781810151838201526020016102db565b505050509050019250505060405180910390f35b34801561031357600080fd5b5061031c610577565b6040805167ffffffffffffffff9092168252519081900360200190f35b34801561034557600080fd5b506040805160206004803580820135838102808601850190965280855261038e953695939460249493850192918291850190849080828437509497506105929650505050505050565b604080519115158252519081900360200190f35b600254610100900461ffff165b90565b60035490565b60018054604080516020601f600260001961010087891615020190951694909404938401819004810282018101909252828152606093909290918301828280156104435780601f1061041857610100808354040283529160200191610443565b820191906000526020600020905b81548152906001019060200180831161042657829003601f168201915b5050505050905090565b60025460ff1690565b600454600254600080546040805160208084028201810190925282815292946060948694600160a060020a0390921693859360ff90921692918491908301828280156104cb57602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116104ad575b50505050509150925092509250909192565b6002546301000000810463ffffffff169167010000000000000090910467ffffffffffffffff1690565b600454600160a060020a031690565b6060600080548060200260200160405190810160405280929190818152602001828054801561044357602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311610550575050505050905090565b600254670100000000000000900467ffffffffffffffff1690565b80516000906105a790829060208501906105b0565b50600192915050565b828054828255906000526020600020908101928215610612579160200282015b82811115610612578251825473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a039091161782556020909201916001909101906105d0565b5061061e929150610622565b5090565b6103af91905b8082111561061e57805473ffffffffffffffffffffffffffffffffffffffff191681556001016106285600a165627a7a72305820658883957d11d009ad3fb8827a668cc5a6584cf4ae5e0f6c1be9a1081bc72d5c0029"

var createContract = serojs.createContract(abi,data)

var createData= createContract.encodeConstructorParams(registers,
    registerscode,
    decimals,
    count,
    number,
    blockN,
    totalSupply,
    own)

console.log(createData);
