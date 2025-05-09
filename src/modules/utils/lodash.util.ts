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

export function notIncludes<T>(array: T[], value: T): boolean {
  return !_.includes(array, value);
}

export function isDefinedAndNotEmpty(value: any): boolean {
  return isDefined(value) && isNotEmpty(value);
}

export function isValidAndDefined(value: any): boolean {
  return isDefined(value) && value;
}

export function isValidAndNotEmpty(value: any): boolean {
  return isNotEmpty(value) && value;
}

export function convertToString(value: any): string {
  return _.toString(value);
}

export function isNotNull(value: any): boolean {
  return !_.isNull(value);
}

export function isNull(value: any): boolean {
  return _.isNull(value);
}

export function isArray(value: any): boolean {
  return _.isArray(value);
}

export function size(value: any): number {
  return _.size(value);
}

export function isNotEqual(value1: any, value2: any): boolean {
  return !_.isEqual(value1, value2);
}

export function isUndefinedOrNotValid(value: any): boolean {
  return isUndefined(value) || !value;
}

export function isNotEmptyAndNotAll(value: any): boolean {
  return isNotEmpty(value) && value != 'all';
}

export function indexOf(value1: any, value2: string): number {
  return _.indexOf(value1, value2);
}

export function escapeRegExp(value: any): string {
  return _.escapeRegExp(value);
}

export function flattenDeep(value: any): string {
  return _.flattenDeep(value);
}

export function find(data: any, match: any) {
  return _.find(data, match);
}

export function isEqual(data1: any, data2: any): boolean {
  return _.isEqual(data1, data2);
}

export function replace(data: any, match: any, key: string): string {
  return _.replace(data, match, key);
}

export function isDefinedAndNotNull(value: any): boolean {
  return !_.isUndefined(value) && !_.isNull(value) && value !== '';
}

export function isUndefinedOrNull(value: any): boolean {
  return isUndefined(value) || isNull(value) || value === '';
}
