const $ = window.$;
$(document).ready(function () {
  /**
   * Task 02:
   * Listen for changes on each INPUT checkbox:
   * - if the checkbox is checked, you must store Amenity ID in a variable (dictionary or list)
   * - if the checkbox is unchecked, you must remove Amenity ID from variable
   * - update H4 tag inside DIV Amenities with list of Amenities checked
   **/
  const my_amenities = {};
  const my_states = {};
  const my_cities = {};
  let my_list = [];
  const checkbox = $('.amenities input[type="checkbox"]');
  const checkboxStates = $('.locations .popover li > h2 > input[type="checkbox"]');
  const checkboxCities = $('.locations .popover li > ul li > input[type="checkbox"]');
  checkbox.prop('checked', false);
  checkboxStates.prop('checked', false);
  checkboxCities.prop('checked', false);

  function checkBoxActions (checkbox, dict, additionalDict = null) {
    my_list = [];
    const dataId = $(checkbox).attr('data-id');
    const data_name = $(checkbox).attr('data-name');
    if (checkbox.checked) {
      dict[dataId] = data_name;
    } else {
      delete (dict[dataId]);
    }
    for (const key in dict) {
      my_list.push(dict[key]);
    }
    if (additionalDict != null) {
      for (const key in additionalDict) {
        my_list.push(additionalDict[key]);
      }
    }
    my_list = my_list.join(', ');
    return my_list;
  }

  checkbox.change(function () {
    my_list = checkBoxActions(this, my_amenities);
    $('div.amenities > h4').text(my_list);
  });

  checkboxStates.change(function () {
    my_list = checkBoxActions(this, my_states, my_cities);
    $('div.locations > h4').text(my_list);
  });

  checkboxCities.change(function () {
    my_list = checkBoxActions(this, my_cities, my_states);
    $('div.locations > h4').text(my_list);
  });

  /**
   * Task 03:
   * Request http://0.0.0.0:5001/api/v1/status/:
   * - If in the status is OK, add class available to the DIV#api_status
   * - Else, remove the class available to the DIV#api_status
   **/
  const apiStatus = $('DIV#api_status');
  $.ajax('http://0.0.0.0:5001/api/v1/status/').done(function (value) {
    if (value.status === 'OK') {
      apiStatus.addClass('available');
    } else {
      apiStatus.removeClass('available');
    }
  });

  function search (the_amenities, the_states, the_cities) {
    const data = {};
    if (the_amenities != null) {
      data.amenities = the_amenities;
    }
    if (the_states != null) {
      data.states = the_states;
    }
    if (the_cities != null) {
      data.cities = the_cities;
    }
    const placesSearch = $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      dataType: 'json',
      contentType: 'application/json',
      method: 'POST',
      data: JSON.stringify(data)
    });
    placesSearch.done(function (data) {
      for (let i = 0; i < data.length; i++) {
        const placeId = data[i].id;
        const place_name = data[i].name;
        const price_by_night = data[i].price_by_night;
        const max_guest = data[i].max_guest;
        const max_rooms = data[i].number_rooms;
        const max_bathrooms = data[i].number_bathrooms;
        const desc = data[i].description;
        const article = $('<article></article>');
        const titleBox = $("<div class='title_box'><h2></h2><div class='price_by_night'></div></div>");
        titleBox.find('> h2').html(place_name);
        titleBox.find('.price_by_night').html('$' + price_by_night);
        article.append(titleBox);
        const information = $("<div class='information'></div>");
        let guestString = ' Guest';
        if (max_guest > 1) {
          guestString = ' Guests';
        }
        const guest = $("<div class='max_guest'></div>").html(max_guest + guestString);
        information.append(guest);
        let roomString = ' Bedroom';
        if (max_rooms > 1) {
          roomString = ' Bedrooms';
        }
        const rooms = $("<div class='number_rooms'></div>").html(max_rooms + roomString);
        information.append(rooms);
        let bathString = ' Bathroom';
        if (max_bathrooms > 1) {
          bathString = ' Bathrooms';
        }
        const bathrooms = $("<div class='number_bathrooms'></div>").html(max_bathrooms + bathString);
        information.append(bathrooms);
        article.append(information);
        const description = $("<div class='description'></div>").html(desc);
        article.append(description);
        const reviews = $("<div class='reviews'><span>show</span><h2>Reviews</h2><ul></ul></div>");
        reviews.find('span').attr('data-id', placeId);
        article.append(reviews);
        $('SECTION.places').append(article);
      }
    });
  }

  search();

  $('.filters > button').click(function () {
    $('SECTION.places').empty();
    search(my_amenities, my_states, my_cities);
  });

  setTimeout(function () {
    $('.reviews span').click(function () {
      if ($(this).text() === 'show') {
        const placeId = $(this).attr('data-id');
        const url = 'http://0.0.0.0:5001/api/v1/places/' + placeId + '/reviews';
        const my_reviews = $.ajax(url);
        const review = $(this);
        let my_user;
        my_reviews.done(function (data) {
          for (let i = 0; i < data.length; i++) {
            my_user = $.ajax('http://0.0.0.0:5001/api/v1/users/' + data[i].user_id);
            my_user.done(function (userData) {
              let date = new Date(data[i].created_at);
              date = date.getDate() + 'th ' + ' ' + date.toLocaleString('default', { month: 'long' }) + ' ' + date.getFullYear();
              review.parent().find('ul').append('<li><h2>From ' + userData.first_name + ' ' + userData.last_name + ' the ' + date + '</h2><p>' + data[i].text + '</p></li>');
            });
          }
        });
        $(this).text('hide');
      } else {
        $(this).text('show');
        $(this).parent().find('ul').empty();
      }
    });
  }, 1000);
});
