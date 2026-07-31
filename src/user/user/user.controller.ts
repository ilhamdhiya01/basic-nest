import {
  Body,
  Controller,
  Get,
  type HttpRedirectResponse,
  Inject,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { type Response, type Request } from 'express';
import { UserService } from './user.service';
import { Connection } from '../connection/connection';
import { MailService } from '../mail/mail.service';
import { UserRepository } from '../user-repository/user-repository';
/**
 * MemberService: injected to demonstrate dynamic resolution via ModuleRef
 */
import { MemberService } from '../member/member.service';

/**
 * @Controller sets the base path for all routes in this class
 */
@Controller('/api/user')
export class UserController {
  /**
   * Constructor injection: NestJS automatically injects providers
   * based on their TypeScript type (token).
   * - service → UserService instance
   * - connection → whichever Connection subclass was registered (MySQL or MongoDB)
   * - mailService → the pre-created mailService instance (useValue)
   * - userRepository → the instance created by the factory function
   */
  constructor(
    private service: UserService,
    private connection: Connection,
    private mailService: MailService,
    private userRepository: UserRepository,
    /**
     * memberService → MemberService instance (uses ModuleRef internally)
     */
    private memberService: MemberService,
    /**
     * @Inject with a string token: used when the provider token is a
     * string (like 'EmailService') instead of a class.
     * This resolves to the same MailService instance via useExisting alias.
     */
    @Inject('EmailService') private emailService: MailService,
  ) {}

  sendEmail() {
    return this.emailService.send();
  }

  /**
   * Member service routes
   * These routes demonstrate calling MemberService which internally
   * uses ModuleRef to dynamically resolve providers (Connection, MailService)
   * instead of relying on constructor injection.
   * Implementation: src/user/member/member.service.ts
   */

  /**
   * Route: GET /api/user/member/connection
   * Returns the connection name by dynamically resolving Connection via ModuleRef
   */
  @Get('/member/connection')
  getFromMemberService() {
    return this.memberService.getConnectionName();
  }

  /**
   * Route: GET /api/user/member/send-email
   * Sends an email by dynamically resolving MailService via ModuleRef
   */
  @Get('/member/send-email')
  getFromMemberServiceUser() {
    this.memberService.sendEmail();
  }

  /**
   * Route: GET /api/user/send-alias
   * Demonstrates using the aliased provider (EmailService → MailService)
   */
  @Get('/send-alias')
  sendAlias() {
    return this.emailService.send();
  }

  /**
   * Route: GET /api/user/connection
   * Shows how multiple injected providers work together:
   * 1. userRepository.save() uses its injected Connection
   * 2. mailService.send() logs a message
   * 3. connection.getName() returns the connection name
   */
  @Get('/connection')
  getConnection() {
    this.userRepository.save();
    this.mailService.send();
    return this.connection.getName();
  }

  /**
   * Route: GET /api/user/hello?first_name=...&last_name=...
   * @Query extracts query parameters from the URL
   */
  @Get('/hello')
  getName(
    @Query('first_name') firstName: string,
    @Query('last_name') lastName: string,
  ): string {
    return `Hello ${firstName} ${lastName}`;
  }

  /**
   * Route: GET /api/user/hello/:name
   * @Param extracts route parameters from the URL
   * Delegates to UserService.sayHello() to demonstrate service injection
   */
  @Get('/hello/:name')
  async sayHello(@Param('name') name: string): Promise<string> {
    return await this.service.sayHello(name);
  }

  /**
   * Route: POST /api/user/hello
   * @Body extracts the request body as a key-value object
   */
  @Post('/hello')
  postName(@Body() body: Record<string, string>): Record<string, string> {
    return body;
  }

  /**
   * @Redirect() decorator tells NestJS to send an HTTP redirect response
   * The return value provides the redirect URL and status code
   */
  @Get('/redirect')
  @Redirect()
  redirect(): HttpRedirectResponse {
    return {
      url: 'https://google.com',
      statusCode: 302,
    };
  }

  /**
   * Route: GET /api/user/set-cookie?name=...
   * @Res gives direct access to the Express Response object
   * res.cookie() sets a cookie on the response
   */
  @Get('/set-cookie')
  setCookie(@Query('name') name: string, @Res() res: Response) {
    res.cookie('name', name);
    return res.status(200).send('Success set cookie');
  }

  /**
   * Route: GET /api/user/get-cookie
   * @Req gives direct access to the Express Request object
   * Reads the "name" cookie that was set by the previous endpoint
   */
  @Get('/get-cookie')
  getCookie(@Req() req: Request): string {
    return req.cookies.name as string;
  }

  /**
   * Route: GET /api/user/view/hello?name=...
   * Renders an HTML template using the view engine (mustache)
   * res.render() passes data to the template and returns HTML
   */
  @Get('/view/hello')
  viewHello(@Query('name') name: string, @Res() res: Response) {
    return res.render('index.html', { title: 'Template Engine', name });
  }
}
