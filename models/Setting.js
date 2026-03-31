const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  group: { type: String, enum: ['general', 'seo', 'social'], default: 'general' },
});

settingSchema.statics.getAll = async function () {
  const settings = await this.find();
  const obj = {};
  settings.forEach(s => { obj[s.key] = s.value; });
  return obj;
};

settingSchema.statics.set = async function (key, value, group) {
  return this.findOneAndUpdate(
    { key },
    { key, value, group: group || 'general' },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Setting', settingSchema);
