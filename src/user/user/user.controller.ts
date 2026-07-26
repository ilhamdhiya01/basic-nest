import {
  Body,
  Controller,
  Get,
  type HttpRedirectResponse,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { type Response, type Request } from 'express';

@Controller('/api/user')
export class UserController {
  @Get('/hello')
  // eslint-disable-next-line @typescript-eslint/require-await
  async getName(
    @Query('first_name') firstName: string,
    @Query('last_name') lastName: string,
  ): Promise<string> {
    return `Hello ${firstName} ${lastName}`;
  }

  @Get('/hello/:name')
  getPathName(@Param('name') name: string): string {
    return `GET path ${name}`;
  }

  @Post('/hello')
  postName(@Body() body: Record<string, string>): Record<string, string> {
    return body;
  }

  @Get('/redirect')
  @Redirect()
  redirect(): HttpRedirectResponse {
    return {
      url: 'https://google.com',
      statusCode: 302,
    };
  }

  @Get('/set-cookie')
  setCookie(@Query('name') name: string, @Res() res: Response) {
    res.cookie('name', name);
    return res.status(200).send('Success set cookie');
  }

  @Get('/get-cookie')
  getCookie(@Req() req: Request): string {
    return req.cookies.name as string;
  }
}
