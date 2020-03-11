const base_uri = '/slots';

function compare(a, b) {
  let sortBy = [{
    prop:'date',
    direction: 1
  },{
    prop:'number',
    direction: 1
  }];
  let i = 0, result = 0;
  while(i < sortBy.length && result === 0) {
    result = sortBy[i].direction*(a[ sortBy[i].prop ] < b[ sortBy[i].prop ] ? -1 : (a[ sortBy[i].prop ] > b[ sortBy[i].prop ] ? 1 : 0));
    i++;
  }
  return result;
}

module.exports.controller = (app, db) => {
  app.get(`${base_uri}`, (req, res) => {
    let data = db.slots.find();

    data.sort(compare);
    if (req.headers['content-type'] == 'application/json') {
      return res.json(data);
    } else {
      return res.render('slots', {data, title: 'Slot Booking'});
    }
  });

  app.post(`${base_uri}`, (req, res) => {
    let {number, name, date} = req.body
    
    if (number && name && date){
      if (Date.parse(date).is().sunday()){
        let message = "we are closed on Sunday";
        if (req.headers['content-type'] == 'application/json') {
          return res.status(400).json({success: false, message})
        } else {
          return res.render('slots', {data: [], message});
        }
      }

      let max_slots_today = Date.parse(date).getDay() < 6 ? 2 : 4;
      let next_3_weeks = Date.today().add({weeks: 3});

      if (Date.parse(date) < next_3_weeks){
        let message = `minimum able to book on ${next_3_weeks.toString("dddd, MMMM dd, yyyy")}`;
        if (req.headers['content-type'] == 'application/json') {
          return res.status(400).json({success: false, message})
        } else {
          return res.render('slots', {data: [], message});
        }
      }

      if(db.slots.find({number, date}).length > max_slots_today){
        let message = `slot not available`;
        if (req.headers['content-type'] == 'application/json') {
          return res.status(400).json({success: false, message})
        } else {
          return res.render('slots', {data: [], message});
        }
      }
  
      db.slots.save({number, name, date});

      if (req.headers['content-type'] == 'application/json') {
        return res.json({success: true})
      } else {
        return res.redirect(base_uri);
      }
    }
    return res.status(400).json({success: false, message: "required property number, name, date"})
  });
};