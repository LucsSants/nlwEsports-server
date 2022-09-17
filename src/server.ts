import express, { response }  from "express";
import cors from 'cors';
import {PrismaClient} from '@prisma/client';
import {covertHoursStringToMinutes} from './utils/convert-hours-string-to-minutes'
import { convertMinutesToHoursString } from "./utils/convert-minutes-to-hours-string";

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient()

app.get('/games',  async (request,response)=> {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select:{
          ads:true,
        }
      }
    }
  })
  return response.json(games);
})

app.post('/games/:id/ads', async (resquest, response) => {
  const gameId = resquest.params.id;
  const body : any = resquest.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsOfPlaying: body.yearsOfPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: covertHoursStringToMinutes(body.hourStart),
      hourEnd: covertHoursStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,

    }
  })

  return response.status(201).json(ad)
})


app.get('/games/:id/ads', async (request, response) => {
   const gameId = request.params.id
   
   const ads = await prisma.ad.findMany({
    select:{
      id:true,
      name:true,
      weekDays:true,
      useVoiceChannel:true,
      yearsOfPlaying:true,
      hourStart:true,
      hourEnd:true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'desc',

    }
   })

  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHoursString(ad.hourStart),
      hourEnd: convertMinutesToHoursString(ad.hourEnd)
    }
  }))
})

app.get('/ads/:id/discord', async (request, response) => {
   const adId = request.params.id

   const ad = await prisma.ad.findUniqueOrThrow({
    select:{
      discord:true
    },
    where : {
      id: adId,
    }
   })

  response.json({
    discord:ad.discord
  })
})

app.listen(3333)