module.exports = class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || null;
    this.price = parseFloat(data.price);
    this.sku = data.sku;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
};
"// Product model validation" 
