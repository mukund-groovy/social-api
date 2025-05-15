import * as _ from 'lodash';

export function isNotEmpty(value: any): boolean {
  return !_.isEmpty(value);
}

export function isDefined(value: any): boolean {
  return !_.isUndefined(value);
}

export function isEmpty(value: any): boolean {
  return _.isEmpty(value);
}

export function isUndefined(value: any): boolean {
  return _.isUndefined(value);
}

export function includes<T>(array: T[], value: T): boolean {
  return _.includes(array, value);
}

export function isValidAndDefined(value: any): boolean {
  return isDefined(value) && value;
}

export function convertToString(value: any): string {
  return _.toString(value);
}
