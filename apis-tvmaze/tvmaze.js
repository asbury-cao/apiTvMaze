"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TVMAZE_API = 'http://api.tvmaze.com/search/shows';
const EPISODE_API = 'http://api.tvmaze.com/shows/';

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {

  const response = await axios.get(TVMAZE_API,
    { params: { q: searchTerm } });

  // returns an array of all of the shows
  return response.data.map(function (show) {
    let { show: { id, name, summary, image } } = show;
    image = getImage(image);

    return { id, name, summary, image };

  });


}



/** Function retrieves a show's poster image.
 * Takes in a show object, returns a URL for the original image OR a boilerplate
 * 'missing image' jpeg.
 */
function getImage(images) {

  const missingImage = 'https://tinyurl.com/tv-missing';

  if (!images) {
    return missingImage;
  }
  else {
    return (images.original);
  }

}


/** Given list of shows, create markup for each and append to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {

    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});



/** Adds eventHandler to Episodes button.
 * Gets the show ID, and appends to the DOM.
 * TODO: Make regular function for testability. wrap the evt.target in jQuery
 */
$showsList.on("click", 'button', async function (evt) {
  evt.preventDefault();
  console.log(evt.target);
  let targetDIV = evt.target.closest('.Show');
  let showID = Number($(targetDIV).data('showId'));

  let episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);


});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 * TODO: Change EPISODE_API naming
 */

async function getEpisodesOfShow(id) {
  const idURL = `${EPISODE_API}${id}/episodes`;
  const response = await axios.get(idURL);

  return response.data.map(function (episode) {
    const { id, name, season, number } = episode;
    return { id, name, season, number };

  });
}




/** populateEpisodes: accepts input of array of episode objects and appending
 * that information to the DOM
 * TODO: Clear current Episode list (ul: episodesList)   $showsList.empty();

  */

function populateEpisodes(episodes) {

  const $episodeList = $('#episodesList');
  for (let episode of episodes) {
    const { name, season, number } = episode;
    $('<li>')
      .text(`${name} (season: ${season}, number: ${number})`)
      .appendTo($episodeList);
  }

  $('#episodesArea').css("display", "block");
};
