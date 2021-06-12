import { Context } from 'koa'
import {
  Controller, // фабрика декораторов, принимающая эндпоинт как аргумент. На класс
  Get, // ФД, создающая GET эндполинт по переданному пути. На метод
  Post, // то же самое, но POST
  Put, // PUT метод
  Delete, // DELETE метод
  Flow, // Классовый или методовый декоратор, какой middleware повесить на каждый метод данного контроллера
  Version, // Декоратор метода. Вешается для пометки версии метода
  Ctx, // Контекст запроса, сам запрос-ответ
  Query,
  Params, // Query params ('/route/:param' kind of) decorator. Attached to the params of a method
  Body,
} from 'koa-ts-controllers'

const middleware = async (ctx, next) => {
  console.log(ctx);
  console.log(next);
  await next()
  
  console.log('super!');
}

@Controller('/my') // роут какой?
@Flow([ middleware ]) // регистрируем любой KOA middleware, который нужно выполнять для всех роутов. ВСЕГДА В МАССИВЕ, иначе итераторы в библиотеке едут крышей. Работает также по концепции погружения
export default class MyOtherController {

  @Get('/') // работает НА ВСЕХ роутах нашего контроллера, а это '/api/v2/my/', '/api/v2/my/dang' и так далее
  async myEndpointHandler() {
    console.log('default route');
    
    return 'Default route' // используется для возврата запроса
  }

  @Get('/hello')
  @Version('1')
  // handles 'GET /api/v1/my/hello' ONLY!!!
  async helloVersion1 () {
    return 'Hello v1!'
  }

  @Get('/hello')
  // catches remaining versions -- '/api/v2/my/hello' & '/api/vsupersecret/my/hello'
  // needs to be last
  async helloCatchRemaining() {
    return 'Hello v2 or vsupersecret'
  }

  @Get(/j.{2}n/) // работает через жопу...
  // filters routes by regex, can access multiple
  async multipleRoutes() {
    return 'John of Rick, nice to meet ya'
  }

  @Get('/user/:id')
  // Getting params
  async params1(@Params('id') id: string) {
    // параметр был введен через ctx.params.id и был превращен декоратором в строку
    console.log('user param as string: ' + id);
    return `${id} is a string param!`
  }

  // @Get('/user/:amount') // не сработает, первый вариант поглотит все последующие по этому роуту
  @Get('/user/money/:amount')
  async params2(@Params('amount') amount: number) {
    console.log('user param as number: ' + amount);
    
    return `You want dem moneys: ${amount.toFixed(2)}`
  }

  // @Get('/user/:place') // не сработает, потому что первый роут всё поглощает
  @Get('/user/place/:place')
  async userInPlace(
    @Params('place') place: string,
    @Query('x') x: number,
    @Query('y') y: number
  ) {
    // парсинг параметров: /api/v.../user/<place>?x=124&y=543
    console.log(`user is in ${place} with coords (${x}, ${y})`);
    return `place received: ${place} with coords (${x}, ${y})`
  }

  @Post('/mypost')
  async mypost(
    @Body() body : any // весь body в этом параметре
  ) {
    console.log(body);
    return Object.assign({ hey: 'hello...',  }, body) // ...body
    // do something with it...
  }

  // Указание точного параметра
  @Post('/mypost2')
  async createSpecific(
    @Body('special') special: boolean // инъекция особого параметра в body
  ) {
    console.log(special);
    return special ? 'Yes' : 'no...'
  }

  @Get('/ctx')
  async printContext(
    @Ctx() context: Context // получаем контекст KOA  работаем с ним
  ) {
    return `<pre> ${JSON.stringify(context, null, 2)}</pre>`
  }
}