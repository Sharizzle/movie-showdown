const autoCompleteConfig = {
	renderOption(movie) {
		const imgSrc = movie.Poster === 'N/A' ? './images/none.png' : movie.Poster;
		return `
      <img src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
	},
	inputValue(movie) {
		return movie.Title;
	},
	async fetchData(searchTerm) {
		const response = await axios.get('http://www.omdbapi.com/', {
			params: {
				apikey: 'd9835cc5',
				s: searchTerm
			}
		});

		if (response.data.Error) {
			return [];
		}

		return response.data.Search;
	}
};

createAutoComplete({
	...autoCompleteConfig,
	root: document.querySelector('#left-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
	}
});
createAutoComplete({
	...autoCompleteConfig,
	root: document.querySelector('#right-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
	}
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
	const response = await axios.get('http://www.omdbapi.com/', {
		params: {
			apikey: 'd9835cc5',
			i: movie.imdbID
		}
	});

	console.log(response); //edittt

	summaryElement.innerHTML = movieTemplate(response.data);

	if (side === 'left') {
		leftMovie = response.data;
	} else {
		rightMovie = response.data;
	}

	if (leftMovie && rightMovie) {
		runComparison();
	}
};

const runComparison = () => {
	const leftSideStats = document.querySelectorAll('#left-summary .notification');
	const rightSideStats = document.querySelectorAll('#right-summary .notification');

	leftSideStats.forEach((leftStat, index) => {
		const rightStat = rightSideStats[index];

		const leftSideValue = leftStat.dataset.value;
		const rightSideValue = rightStat.dataset.value;

		if (parseFloat(rightSideValue) > parseFloat(leftSideValue)) {
			leftStat.classList.remove('is-info');
			leftStat.classList.add('is-danger');
		} else {
			rightStat.classList.remove('is-info');
			rightStat.classList.add('is-danger');
		}
	});

	let articles = document.querySelectorAll('article.is-danger');
	let left_count = 0;
	let right_count = 0;

	for (var i = 0; i < articles.length; i++) {
		let side = articles[i].parentElement.id.replace('-summary', '');
		if (side === 'left') {
			left_count += 1;
		} else if (side === 'right') {
			right_count += 1;
		}
	}

	let winner = document.querySelector('.winner');
	let result = document.querySelector('.result');

	if (right_count > left_count) {
		winner.innerHTML = `Go and watch <b>${leftMovie.Title}</b>. We promise you won't regret it. Enjoy!!`;
	} else {
		winner.innerHTML = `Go watch <b>${rightMovie.Title}</b>. We promise you won't regret it. Enjoy!!`;
	}
	result.classList.remove('is-hidden');
};

const movieTemplate = (movieDetail) => {
	if (movieDetail.Type !== 'movie') {
		return `
		<div class="notification is-danger">
		For now, only movies are supported. Please insert a movie into the box. Enjoy!
	  </div>
		`;
	}

	const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
	const metascore = parseInt(movieDetail.Metascore);
	const imdbRating = parseFloat(movieDetail.imdbRating);
	const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
	const ratings_IMD = movieDetail.Ratings[0].Value;
	const ratings_RT = movieDetail.Ratings[1].Value;
	const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
		const value = parseInt(word);

		if (isNaN(value)) {
			return prev;
		} else {
			return prev + value;
		}
	}, 0);

	let condensedPlot = movieDetail.Plot;
	if (condensedPlot.length > 204) {
		condensedPlot = condensedPlot.substring(0, 201) + '...';
	}

	return `
    <article class="media" style = "margin:10px">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${condensedPlot}</p>
        </div>
      </div>
    </article>

    <article data-value=${dollars} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
	</article>
	<article data-value=${ratings_RT} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.Ratings[1].Value}</p>
	  <p class="subtitle">Rotten Tomatoes Review</p>
	</article>
    <article data-value=${imdbVotes} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.imdbVotes}</p>
	  <p class="subtitle">IMDB Votes</p>
	</article>
	<article data-value=${ratings_IMD} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.Ratings[0].Value}</p>
	  <p class="subtitle">Internet Movie Database Review</p>
	</article>
	<article data-value=${awards} class="notification is-info" style = "margin:10px">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
	</article>
	
	
  `;
};
