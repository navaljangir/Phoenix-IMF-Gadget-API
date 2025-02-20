import  { createClient } from "redis";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import dotenv from 'dotenv'
dotenv.config()
const redisClient = createClient({
  url : process.env.REDIS_URL || 'redis://localhost:6379', 
  disableOfflineQueue: true, 
})

const clientConnect = async () => {
  try{
    await redisClient.connect();
  }catch(e){
    console.log('Redis error: ' , e)
  }
};
clientConnect();

redisClient.on('end' , ()=>{
  console.log('Redis Client disconnected')
})


export async function getUniqueName() {
    let codename = '';
    let attempts = 0;
    const REDIS_KEY = "used_codenames";
    while (attempts < 5) {
        const randomName = uniqueNamesGenerator({ 
          dictionaries: [adjectives, animals], 
          style: 'capital' 
        });
        codename = `The ${randomName}`;
        const added = await redisClient.sAdd(REDIS_KEY , codename)
        if(added){
          break;
        }
        attempts++;
      }
      //No Unique found
      if(attempts==5){
        codename += `${Math.floor(Math.random() * 1000)}`;
      }
    return codename;
}


export async function getData(cachedKey : string){
  const cachedData = await redisClient.get(cachedKey);
  return cachedData
}


export async function addKey(key : string,  data : string){
  await redisClient.set(key, data);
}


export const deleteGadgetCache = async () => {
  const keys = await redisClient.keys('gadgets*');
  if (keys.length) await redisClient.del(keys);
};

export const addUser = async(key: string , value : string)=>{
  try{
    await redisClient.sAdd(key , value)
    console.log('added successfully')
  }catch(e){
    console.log(e)
  }
}

export const redisUserExists  = async(value :string)=>{
  try{
    const exists =  await redisClient.sIsMember('active_users' , value)
    return exists
  }catch(e){
    console.log(e)
    return 0
  }
}