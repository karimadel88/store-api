const mongoose = require('mongoose');

async function checkCountries() {
  try {
    await mongoose.connect('mongodb://localhost:27017/store-db');
    console.log('Connected to MongoDB');

    const schema = new mongoose.Schema({ name: String, code: String, isActive: Boolean });
    const Country = mongoose.model('Country', schema);

    const countries = await Country.find({});
    console.log('Countries found:', countries);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCountries();
