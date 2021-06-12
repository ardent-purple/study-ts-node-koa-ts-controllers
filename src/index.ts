import { bootstrapControllers } from 'koa-ts-controllers'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import Koa from 'koa' 
import MyOtherController from './other/myOtherController'

const port = 1337

const app = new Koa()
const router = new Router()

// bootstrapControllers -- асинхронная функция. При использовании esnext и компиляции в es2017 либы, можно использовать высокоуровневый await, но мы просто обернем в асинхронную анонимную и выполним дальше
;(async () => {
  await bootstrapControllers( 
    app, // наше приложение
    {// опции
      router, // роутер, который будет использоваться в приложении
      basePath: '/api', // базовый путь, относительно которого идёт роутинг. 
      // То есть тут будет не url.com/... а url.com/api
      controllers: [
        MyOtherController, // прямое указание класса контроллера
        // __dirname + '/controllers/**/*' // указание с помощью глоба. Не рекомендуется
      ],
      versions: { // версии API
        1: 'Deprecated', // с сообщением -- значит, старая
        2: true, // действующая
        supersecret: true, // особая, ненумерная тоже возможна
      },
      // attachRoutes: true, // позволит сразу прицепить роуты, без дополнительного use
    }
  )

  // подключаем всякий middleware, который идёт до обработки запросов
  app.use(bodyParser())
  
  // можно опустить при attachRoutes = true в опциях подключения контроллеров, однако тогда middleware устанавливать несколько не понятнее
  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(port, () => { console.log('starting app') })
})()

