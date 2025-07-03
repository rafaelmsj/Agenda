import express from 'express'
const Router = express.Router()
import UserController from "../controllers/UserController.js";
import RecoveryPasswordController from "../controllers/RecoveryPasswordController.js";
import AgendaController from "../controllers/AgendaController.js";
import AuthenticateMiddleware from "../middlewares/AuthenticateMiddleware.js";
const Authenticate = AuthenticateMiddleware.authVerify


Router.post('/login', UserController.Login);
Router.post('/user', UserController.Create);
Router.post('/confirm-user', UserController.ConfirmUser);
Router.put('/resend-confirm', UserController.ResendConfirmUser)

Router.post('/create-recovery', RecoveryPasswordController.CreateRecoveryPassword);
Router.post('/recovery-password', RecoveryPasswordController.RecoveryPassword);

Router.get('/', Authenticate, AgendaController.FindAll);
Router.post('/validate', Authenticate, AgendaController.Validate);
Router.post('/appointment', Authenticate, AgendaController.Create);
Router.put('/appointment/:id', Authenticate, AgendaController.Update);
Router.delete('/appointment/', Authenticate, AgendaController.Delete);

export default Router