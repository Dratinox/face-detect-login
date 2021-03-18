import { Request } from "express";
import Payload from "./Payload";

/**
 * Extends Request with Payload that contains userId from JWT token.
 * @param userId:string
 */
type request = Request & Payload;

export default request;
