import React, { useEffect, memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { Card, Skeleton, Input, Row, Col, Divider } from 'antd';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { injectSaga } from 'redux-injectors';
import { selectSongContainer, selectSongsData, selectSongsError, selectQuery } from './selectors';
import { songContainerCreators } from './reducer';
import songContainerSaga from './saga';
import Clickable from '@components/Clickable';
import T from '@components/T';


const { Search } = Input;
const { Meta } = Card;

const CustomCard = styled(Card)`
  && {
    width: ;
    display: flex;
    flex-wrap: wrap;
    color: ${props => props.color};
    ${props => props.color && `color: ${props.color}`};
  }
`;

const SongCard = styled(Card)`
  && {
    margin: 1em;
    
  }
`;

const ImageArt = styled.img`
&& {
    opacity: 0.8;
}
`

const Container = styled.div`
  && {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    max-width: ${props => props.maxwidth}px;
    padding: ${props => props.padding}px;
  }
`;
const ResultContainer = styled.div`
  && {
    display: flex;
    flex-direction: column;
    max-width: 80vw;
    width: 100%;
    margin: 20px auto;
    padding: ${props => props.padding}px;
  }
`;
const RightContent = styled.div`
  display: flex;
  align-self: flex-end;
`;
export function SongContainer({
    dispatchSongs,
    dispatchClearSongs,
    intl,
    songsData = {},
    songsError = null,
    query,
    maxwidth,
    padding
}) {

    const [loading, setLoading] = useState(false);



    useEffect(() => {
        const loaded = get(songsData, 'results', null) || songsError;
        if (loading && loaded) {
            setLoading(false);
        }
    }, [songsData])

    useEffect(() => {
        if (query!='' && songsData?.songs?.length) {
            setLoading(true)
            dispatchSongs(query);
        } 
        else {
            dispatchClearSongs()
            setLoading(false)
        }
    }, []);
    const handleOnChange = rName => {
        if (!isEmpty(rName)) {
            dispatchSongs(rName);
            setLoading(true);

        } else {
            dispatchClearSongs();
        }
    };
    const debouncedHandleOnChange = debounce(handleOnChange, 200);

    const refreshPage = () => {
        history.push('stories');
        window.location.reload();
    };

    const AlbumArt = (source) => {
        const [loaded,setLoaded] = useState(false)
        return (
            <img 
                src = {source}

            />
        )
    } 
    const renderResultList = () => {
        const items = get(songsData, 'results') 
        const totalCount = get(songsData, 'resultCount', 0);
        return (
            (items?.length !== 0 || loading) && (
                <Skeleton loading={loading} active>
                        {totalCount !== 0 && (
                            <div>
                                <T id="matching_results" values={{ totalCount }} />
                            </div>
                        )}
                    <Container>
                           {items?.map((result, index) => (
                                    <SongCard
                                        hoverable
                                        key={index}
                                        style={{ width: 240 }}
                                        cover={<ImageArt alt="example" src={result.artworkUrl100.replace('/100x100bb', '/250x250bb')} />}
                                    >
                                        <Meta title={intl.formatMessage({ id: 'track_name' }, { name: result.trackName })} description={intl.formatMessage({ id: 'artist_name' }, { name: result.artistName })} />
                                    </SongCard>
                              
                            ))}
                        
                    </Container>
                </Skeleton>
            )
        );
    };
    const renderErrorState = () => {
        let songError;
        if (songsError) {

            songError = songsError;
        } else if (!get(songsData, 'songCount', 0)) {
            songError = 'result_search_default';
        }

        return (
            !loading &&
            songError && (
                <CustomCard color={songsError ? 'red' : 'grey'} title={intl.formatMessage({ id: 'result_list' })}>
                    <T id={songError} />
                </CustomCard>
            )
        );
    };
    return (
        <ResultContainer maxwidth={maxwidth} padding={padding}>

            <T marginBottom={10} id="search_itunes" />
            <Search
                data-testid="search-bar"
                defaultValue={query}
                type="text"
                onChange={evt => debouncedHandleOnChange(evt.target.value)}
                onSearch={searchText => debouncedHandleOnChange(searchText)}
            />
            {renderErrorState()}

            {renderResultList()}
        </ResultContainer>

    )
}
SongContainer.propTypes = {
    dispatchSongs: PropTypes.func,
    dispatchClearSongs: PropTypes.func,
    intl: PropTypes.object,
    songsData: PropTypes.shape({
        songs: PropTypes.array,
        songCount: PropTypes.number
    }),
    query: PropTypes.string,
    history: PropTypes.object,
    maxwidth: PropTypes.number,
    padding: PropTypes.number
};

SongContainer.defaultProps = {
    maxwidth: 500,
    padding: 20
};


const mapStateToProps = createStructuredSelector({
    songContainer: selectSongContainer(),
    songsData: selectSongsData(),
    songsError: selectSongsError(),
    query: selectQuery()
});

function mapDispatchToProps(dispatch) {
    const { requestGetSongs, clearSongs } = songContainerCreators;
    return {
        dispatchSongs: query => dispatch(requestGetSongs(query)),
        dispatchClearSongs: () => dispatch(clearSongs())
    };
}


const withConnect = connect(
    mapStateToProps,
    mapDispatchToProps
);

export default compose(
    injectIntl,
    injectSaga({ key: 'songContainer', saga: songContainerSaga }),
    withConnect,
)(SongContainer);