import * as handlebars from "handlebars";


/*
{{#times 10}}
    <span>{{this}}</span>
{{/times}}
*/
handlebars.registerHelper('times', function(n, options) {
  let accum = '';
  
  for(let index = 0; index < n; ++index) {
    accum += options.fn(index, {
      data: {
        index,
        first: index == 0,
        last: index == n - 1
      }
    });
  }

  return accum;
});

/*
{{#for 0 10 2}}
    <span>{{this}}</span>
{{/for}}
*/
handlebars.registerHelper('for', function(from, to, incr, block) {
  var accum = '';
  for(var i = from; i < to; i += incr)
      accum += block.fn(i);
  return accum;
});