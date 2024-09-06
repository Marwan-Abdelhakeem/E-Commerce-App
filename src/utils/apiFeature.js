export class ApiFeature {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }
  pagination() {
    let { page, size } = this.queryData;
    if (!page || page <= 0) {
      page = 1;
    }
    if (!size || size <= 0) {
      size = 3;
    }
    page = parseInt(page);
    size = parseInt(size);
    this.queryData.page = page;
    const skip = (page - 1) * size;
    this.mongooseQuery = this.mongooseQuery.limit(size).skip(skip);
    this.metaData = { page, size };
    return this;
  }
  sort() {
    let { sort } = this.queryData;
    sort = sort?.replaceAll(",", " ");
    this.mongooseQuery = this.mongooseQuery.sort(sort);
    return this;
  }
  select() {
    let { select } = this.queryData;
    select = select?.replaceAll(",", " ");
    this.mongooseQuery = this.mongooseQuery.select(select);
    return this;
  }
  filter() {
    let { page, size, sort, select, ...filter } = this.queryData;
    filter = JSON.parse(
      JSON.stringify(filter).replace(
        /gte|gt|lt|lte|eq|ne|in|nin/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery = this.mongooseQuery.find(filter);
    return this;
  }
}
