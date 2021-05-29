const fetchCharacterById = async (id) => {
  const structureData = (data) => {
    const resultsArray = data.data.results

    const structuredData = resultsArray.map(
      ({ id, name, description, thumbnail }) => {
        return {
          id,
          name,
          description,
          picture: thumbnail.path,
        }
      }
    )
    return structuredData
  }
  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/characters/${id}`,
      {
        params: {
          ts,
          apikey,
          hash,
        },
      }
    )
    return structureData(response.data)
  } catch (error) {
    console.error(error)
  }
}

const getParamFromURL = (param) => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  return parseInt(urlParams.get(param))
}

const displayCharacterInfo = async () => {
  const [character] = await fetchCharacterById(getParamFromURL('id'))
  const { id, name, picture, description } = character
  const characterSection = document.querySelector('#character')
  characterSection.innerHTML = `

  <div class="character__img">
    <img src="${picture + '/portrait_uncanny.jpg'}" alt="${name}" />
  </div>

  <div class="character__info">
    <div class="character__description">
      <h2>${name}</h2>
      <p>
        ${
          description
            ? description
            : `Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, quam
        ut aliquid amet libero voluptates, ipsam eligendi officia itaque
        error quos, molestiae debitis accusamus unde repellendus pariatur
        porro molestias soluta.`
        }
      </p>
    </div>

    <nav class="character__nav">
      <a href="/index.html" class="btn btn-info text-white">Go back</a>
      <a 
      data-id="${id}" 
      class="btn btn-danger" 
      id="favoriteButton"
      >
        Add to favorites <i class="fa fa-star"></i
      ></a>
    </nav>
  </div>
  `
}

const favoriteButton = () => {
  const favoriteButton = document.querySelector('#favoriteButton')

  const addFavorite = (e) => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites'))
    const idFavorite = e.target.dataset.id

    e.target.classList.remove('btn-danger')
    e.target.classList.add('btn-success')
    e.target.innerText = 'Favorite Added!'
    if (!storedFavorites) {
      localStorage.setItem('favorites', JSON.stringify([idFavorite]))

      return
    }

    storedFavorites.push(idFavorite)
    const noDuplicateFavs = [...new Set(storedFavorites)]

    localStorage.setItem('favorites', JSON.stringify(noDuplicateFavs))
  }

  favoriteButton.addEventListener('click', addFavorite)
}

const waitForRender = async () => {
  await displayCharacterInfo()
  favoriteButton()
}
waitForRender()
