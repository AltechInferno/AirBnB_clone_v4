const $ = window.$;
$(document).ready(function () {
  let my_list = [];
  const my_amenities = {};
  const checkbox = $('.amenities input[type="checkbox"]');
  checkbox.prop('checked', false);
  checkbox.change(function () {
    const dataId = $(this).attr('data-id');
    const dataName = $(this).attr('data-name');
    if (this.checked) {
      my_amenities[dataId] = dataName;
    } else {
      delete (my_amenities[dataId]);
    }
    for (const key in my_amenities) {
      my_list.push(my_amenities[key]);
    }
    const output = my_list.join(', ');
    $('div.amenities > h4').text(output);
    my_list = [];
  });
  const apiStatus = $('DIV#api_status');
  $.ajax('http://0.0.0.0:5001/api/v1/status/').done(function (value) {
    if (value.status === 'OK') {
      apiStatus.addClass('available');
    } else {
      apiStatus.removeClass('available');
    }
  });
  const placesSearch = $.ajax({
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    dataType: 'json',
    contentType: 'application/json',
    method: 'POST',
    data: JSON.stringify({})
  });
  placesSearch.done(function (data) {
    for (let i = 0; i < data.length; i++) {
      /** data **/
      const place_name = data[i].name;
      const price_by_night = data[i].price_by_night;
      const max_guest = data[i].max_guest;
      const max_rooms = data[i].number_rooms;
      const max_bathrooms = data[i].number_bathrooms;
      const desc = data[i].description;
      /** Prepare HTML **/
      const article = $('<article></article>');
      const titleBox = $("<div class='title_box'><h2></h2><div class='price_by_night'></div></div>");
      titleBox.find('> h2').html(place_name);
      titleBox.find('.price_by_night').html('$' + price_by_night);
      article.append(titleBox);
      const information = $("<div class='information'></div>");
      let guestString = ' Guest';
      if (max_guest > 1) { guestString = ' Guests'; }
      const guest = $("<div class='max_guest'></div>").html(max_guest + guestString);
      information.append(guest);
      let roomString = ' Bedroom';
      if (max_rooms > 1) { roomString = ' Bedrooms'; }
      const rooms = $("<div class='number_rooms'></div>").html(max_rooms + roomString);
      information.append(rooms);
      let bathString = ' Bathroom';
      if (max_bathrooms > 1) { bathString = ' Bathrooms'; }
      const bathrooms = $("<div class='number_bathrooms'></div>").html(max_bathrooms + bathString);
      information.append(bathrooms);
      article.append(information);
      const description = $("<div class='description'></div>").html(desc);
      article.append(description);
      $('SECTION.places').append(article);
    }
  });
});
