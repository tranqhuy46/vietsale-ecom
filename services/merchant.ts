import axios, { AxiosResponse } from "axios";
import { HOST_URL, HOST_URL_FOR_EXTERNAL_CALL } from "constants/platform";
import { BaseReponse } from "models/common/BaseResponse";
import { HttpQueryParam } from "models/common/SearchQuery";
import { MyFile } from "models/MyFile";
import { Product } from "models/Product";
import {
  CreateProductPayload,
  UploadFilePayload,
} from "models/request-response/Merchant";

export const FETCH_SHOP_PRODUCTS_MERCH = "/merchant/products";
type ProductsResponse = BaseReponse<{ products: Product[] }> | undefined;
export async function fetchShopProductsForMerch(
  token: string,
  shopId: string,
  params?: HttpQueryParam
): Promise<ProductsResponse> {
  try {
    const res = await axios.get<ProductsResponse>(
      HOST_URL + `/dev/merchant/shop/${shopId}/product`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    return {} as ProductsResponse;
  }
}

export const CREATE_SHOP_PRODUCT_MERCH = "/merchant/products";
type CreateProductResponse = BaseReponse<{ product: Product }>;
export async function doCreateShopProduct(
  token: string,
  shopId: string,
  payload: CreateProductPayload
): Promise<CreateProductResponse> {
  try {
    const res = await axios.post<
      CreateProductPayload,
      AxiosResponse<CreateProductResponse>
    >(HOST_URL + `/dev/merchant/shop/${shopId}/product`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    return {} as CreateProductResponse;
  }
}

export const FETCH_SHOP_FILES_MERCH = "/merchant/files";
type FilesResponse = BaseReponse<{ upload_files: MyFile[] }> | undefined;
export async function fetchShopFilesForMerch(
  token: string,
  shopId: string
): Promise<FilesResponse> {
  try {
    const res = await axios.get<FilesResponse>(
      HOST_URL_FOR_EXTERNAL_CALL + `/merchant/shop/${shopId}/file`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    return {} as FilesResponse;
  }
}

export const UPLOAD_SHOP_FILE_MERCH = "/merchant/files";
export type UploadProgressCallback = ((progressEvent: any) => void) | undefined;
type UploadFileResponse = BaseReponse<{ upload_file: MyFile }>;
export async function doUploadFile(
  token: string,
  shopId: string,
  payload: FormData,
  onUploadProgress?: UploadProgressCallback
): Promise<UploadFileResponse> {
  try {
    const res = await axios.post<FormData, AxiosResponse<UploadFileResponse>>(
      HOST_URL + `/dev/merchant/shop/${shopId}/file`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );
    return res.data;
  } catch (error) {
    return {} as UploadFileResponse;
  }
}