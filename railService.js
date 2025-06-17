import rail from "indian-rail-api";

export const getTrainsBetween = (from, to) =>
  new Promise((resolve, reject) => {
    rail.getTrainBtwStation(from, to, (res) => {
      try {
        resolve(JSON.parse(res));
      } catch (e) {
        reject(e);
      }
    });
  });

export const getTrainsOnDate = (from, to, dateDDMMYYYY) =>
  new Promise((resolve, reject) => {
    rail.getTrainOnDate(from, to, dateDDMMYYYY, (res) => {
      try {
        resolve(JSON.parse(res));
      } catch (e) {
        reject(e);
      }
    });
  });

export const getRoute = (trainNo) =>
  new Promise((resolve, reject) => {
    rail.getRoute(trainNo, (res) => {
      try {
        resolve(JSON.parse(res));
      } catch (e) {
        reject(e);
      }
    });
  });
