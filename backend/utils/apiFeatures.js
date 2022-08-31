class APIFeatures {
  //mongoose query & req.query , query string
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) FILTERING
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) ADVANCED FILTERING
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );

    this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    //2  SORTING
    if (this.queryString.sort) {
      const sorter = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sorter);
      //sort('price')
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3 FIELD LIMITTING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // minus will exclude the field within a select
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4 PAGINATION
    const page = this.queryString.page * 1 || 1;

    const limit = this.queryString.limit * 1 || 100;

    const skip = (page - 1) * limit;
    // skip -> method for pagination , limit -> the amount of results ,
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
