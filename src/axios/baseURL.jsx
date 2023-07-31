import axios from 'axios'

const httpRequest= axios.create({
    baseURL: 'https://eth-goerli.g.alchemy.com/v2/-uYjnAo8550pst_k0w2mK8pBTwy6Upkm',
    headers:{
    }
})


export default httpRequest;