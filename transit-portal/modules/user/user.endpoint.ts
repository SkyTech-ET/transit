import http from "@/modules/utils/axios/index";
import { RecordStatus } from "../common/common.types";

const userEndpoints = Object.freeze({
  base: "/User",
  getAll: "/User/GetAll",
  getById: "/User/GetById",
  getByOrgId: "/User/GetByOrganization",

  create: "/User/Create",
  update: "/User/Update",
  delete: "/User/Delete",
});


export const getUsers = (recordStatus: RecordStatus = RecordStatus.Active, pageNumber: number = 1): Promise<Response> => {
  return http.get({ url: `${userEndpoints.getAll}`,params: { recordStatus:recordStatus,pageNumber:pageNumber } });
};

export const getUsersByOrg = (id: number, recordStatus: RecordStatus = RecordStatus.Active): Promise<Response> => {
  return http.get({ url: `${userEndpoints.getByOrgId}/${id}`,params: { recordStatus } });
};

export const getUser = (id: number): Promise<Response> => {
  return http.get({ url: userEndpoints.getById, params: { Id: id } });
};

export const addUser = (payload: any): Promise<Response> => {
  return http.post({ url: userEndpoints.create, data: payload });
};

export const updateUser = (payload: any, id: number): Promise<Response> => {
  return http.put({ url: `${userEndpoints.update}`, data: { ...payload, id: id } });
};

export const deleteUser = (id: number): Promise<Response> => {
  return http.delete({ url: userEndpoints.delete, params: { id: id } });
};