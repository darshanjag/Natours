class ApiFeatures{
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filter(){
        const reqQuery = {...this.queryString}
        const excludedFileds= ['page','sort','limit','fields'];
        excludedFileds.forEach(el=> delete reqQuery[el]);
        
        //1.advance filtering
        let queryStr = JSON.stringify(reqQuery);
        queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`);
    
           this.query.find(JSON.parse(queryStr));
           return this;
    }
    sort(){
        if(this.queryString.sort){
          
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query= this.query.sort(sortBy);
        }else{
            this.query= this.query.sort("-createdAt");
        }
        return this;
    }

    limitFields(){
        if(this.queryString.fields){
           
          
            const fields = this.queryString.fields.split(",").join(" ");
          
            this.query = this.query.select(fields);
           
        }else{
            this.query.select("-__v");
        }
        return this;
    }

    paginate(){
        const page = this.queryString.page *1 || 1;
        const limit = this.queryString.limit *1 ||10;
        const skip = (page-1)* limit;
        this.query = this.query.skip(skip).limit(limit);
    
        return this;
    }
}

module.exports = ApiFeatures;