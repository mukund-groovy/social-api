import { messages } from 'src/message.config';
import { isNotEmpty, isValidAndDefined } from './lodash.util';

//Function for add pagination, sorting in list api
export function sortFilterPagination(
  currentPage,
  perPage,
  total_record,
  additionalSortData = null,
  field = null,
  orderBy = null,
) {
  try {
    const page: any = currentPage ? parseInt(currentPage) : 1;
    const per_page: any = perPage ? parseInt(perPage) : 20;

    const total_pages = Math.ceil(total_record / per_page);
    const prev_enable = parseInt(page) - 1;
    const next_enable = total_pages <= page ? 0 : 1;
    const start_from: any = (page - 1) * per_page;

    const sort = {};
    let sortField = '_id';
    let sortOrder = -1;
    const sortData = {
      _id: '_id',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      createdBy: 'createdBy',
      updatedBy: 'updatedBy',
      ...additionalSortData, // Merge additional fields into the default sortData
    };

    //Sort data
    if (
      isValidAndDefined(field) &&
      isNotEmpty(sortData) &&
      Object.keys(sortData).includes(field)
    ) {
      sortField = sortData[field];
    }

    if (isValidAndDefined(orderBy) && (orderBy == -1 || orderBy == 1)) {
      sortOrder = parseInt(orderBy);
    }
    sort[sortField] = sortOrder;

    return {
      per_page,
      page,
      total_pages,
      prev_enable,
      next_enable,
      start_from,
      sort,
      sort_by: sortOrder,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error) || messages.UNKNOWN_ERROR;
    this.logger.error('Error : sortFilterPagination', message);
    throw new Error(messages.SOMETHING_WENT_WRONG);
  }
}
