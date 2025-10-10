// src/api/services/crud.service.js
const mapOut = (doc) => {
  const o = doc?.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = o || {};
  return { ID: _id?.toString?.(), ...rest };
};
const mapIn = (data) => {
  const { ID, ...rest } = data || {};
  return rest;
};

function registerCRUD(srv, cdsEntity, Model, opts = {}) {
  const { uniqueCheck, beforeCreate, beforeUpdate } = opts;

  srv.on('READ', cdsEntity, async (req) => {
    if (req.data.ID) {
      const doc = await Model.findById(req.data.ID);
      return doc ? [mapOut(doc)] : [];
    }
    const top  = Number(req._query?.$top ?? 0);
    const skip = Number(req._query?.$skip ?? 0);
    let q = Model.find();
    if (skip) q = q.skip(skip);
    if (top)  q = q.limit(top);
    const docs = await q;
    return docs.map(mapOut);
  });

  srv.on('CREATE', cdsEntity, async (req) => {
    if (beforeCreate) await beforeCreate(req);
    if (uniqueCheck) await uniqueCheck(req);
    const created = await Model.create(mapIn(req.data));
    return mapOut(created);
  });

  srv.on('UPDATE', cdsEntity, async (req) => {
    if (!req.data.ID) req.reject(400, 'ID requerido');
    if (beforeUpdate) await beforeUpdate(req);
    const updated = await Model.findByIdAndUpdate(req.data.ID, mapIn(req.data), { new: true, runValidators: true });
    if (!updated) req.reject(404, 'No encontrado');
    return mapOut(updated);
  });

  srv.on('DELETE', cdsEntity, async (req) => {
    const ok = await Model.findByIdAndDelete(req.data.ID);
    if (!ok) req.reject(404, 'No encontrado');
  });
}

module.exports = { registerCRUD };
