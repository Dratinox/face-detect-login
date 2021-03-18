import axios, { AxiosRequestConfig } from "axios";
import config from "../../config/endpoints.config";

export interface IFaceVerificationResponse {
    isIdentical: boolean;
    confidence: number;
}

export interface IFaceDetectionResponse {
    faceId: string;
    faceRectangle: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
}

/**
 * Call Azure face detection
 *
 * @param {*} imageData image as dataURL
 */
export const detectFace = async (imageData: string): Promise<IFaceDetectionResponse[]> => {
    const image = Buffer.from(imageData.split("base64")[1], "base64");
    const axiosRequestParameters: AxiosRequestConfig = {
        url: `${config.FACE_API_HOST}${config.FACE_API_PATH_DETECT}`,
        data: image,
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": Buffer.byteLength(imageData),
            "Ocp-Apim-Subscription-Key": config.FACE_API_KEY,
        },
    };

    try {
        const res = await axios(axiosRequestParameters);
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
};

/**
 * Call Azure Face verification
 *
 * @param {*} faceId1 face1 to compare
 * @param {*} faceId2 face2 to compare
 */
export const verifyFace = async (faceId1: string, faceId2: string): Promise<boolean> => {
    const axiosRequestParameters: AxiosRequestConfig = {
        url: `${config.FACE_API_HOST}${config.FACE_API_PATH_VERIFY}`,
        method: "POST",
        data: JSON.stringify({ faceId1: faceId1, faceId2: faceId2 }),
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": config.FACE_API_KEY,
        },
    };

    try {
        const res: IFaceVerificationResponse = await (await axios(axiosRequestParameters)).data;
        if (res.isIdentical && res.confidence > Number(config.FACE_API_CONFIDENCE_TRESHOLD)) {
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
};
