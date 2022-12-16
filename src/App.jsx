import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Popover,
  Typography,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";
import InfiniteScroll from "react-infinite-scroller";

const App = () => {
  const [ rows, setRows ] = useState([]);
  const [ nextToken, setNextToken ] = useState("");
  const [ focusedVideo, setFocusedVideo ] = useState(null)

  useEffect(() => {
    dayjs.extend(relativeTime);
    if (!rows.length) {
      generateItems();
    }
  }, []);

  const generateItems = () => {
    const params = nextToken
      ? {
          part: "snippet",
          type: "video",
          maxResults: 8,
          q: "programming",
          key: import.meta.env.VITE_YOUTUBE_KEY,
          pageToken: nextToken,
        }
      : {
          part: "snippet",
          type: "video",
          maxResults: 8,
          q: "programming",
          key: import.meta.env.VITE_YOUTUBE_KEY,
        };

    axios
      .get("https://www.googleapis.com/youtube/v3/search", {
        params,
      })
      .then((res) => {
        console.log("res: ", res.data.nextPageToken)
        setRows(rows.concat(res.data.items))
        setNextToken(res.data.nextPageToken)
      })
  };

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (value) => (event) => {
    console.log('value: ', value)
    setAnchorEl(event.currentTarget)
    setFocusedVideo(value)
  };

  const handlePopoverClose = () => {
    setAnchorEl(null)
    setFocusedVideo(null)
  };

  const open = Boolean(anchorEl);

  const handleOpenVideo = (videoId) => {
    window.open(`https://youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <Container>
      <Typography className="py-5 !text-base !font-bold">Video List</Typography>
      <InfiniteScroll
        pageStart={0}
        loadMore={generateItems}
        hasMore={nextToken ? true : false}
        loader={<CircularProgress />}
      >
        <Grid container spacing={2}>
          {rows.map(({ id, snippet }, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3} xl={3}>
              <Card
                aria-owns={open ? "mouse-over-popover" : undefined}
                aria-haspopup="true"
                onMouseOver={handlePopoverOpen({id, snippet})}
                onMouseOut={handlePopoverClose}
                onClick={() => handleOpenVideo(id.videoId)}
                className="cursor-pointer"
              >
                <CardMedia
                  component="img"
                  image={snippet?.thumbnails?.high?.url}
                />
                <CardContent>
                  <Typography className="!text-base !font-bold w-full h-12 text-ellipsis overflow-hidden">
                    {snippet?.title}
                  </Typography>
                  <Typography className="!text-base w-full h-6 text-ellipsis overflow-hidden">
                    {snippet?.channelTitle}
                  </Typography>
                  <Typography className="!text-sm !text-gray-600">
                    {dayjs(snippet?.publishedAt).fromNow()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Card
          onClick={() => handleOpenVideo(focusedVideo?.id?.videoId)}
          className="cursor-pointer"
        >
          <CardMedia
            component="img"
            image={focusedVideo?.snippet?.thumbnails?.high.url}
          />
          <CardContent>
            <Typography className="!text-base !font-bold w-full h-12 text-ellipsis overflow-hidden">
              {focusedVideo?.snippet?.title}
            </Typography>
            <Typography className="!text-base w-full h-6 text-ellipsis overflow-hidden">
              {focusedVideo?.snippet?.channelTitle}
            </Typography>
            <Typography className="!text-sm !text-gray-600">
              {focusedVideo?.snippet?.publishedAt && dayjs(focusedVideo?.snippet?.publishedAt).fromNow()}
            </Typography>
          </CardContent>
        </Card>
      </Popover>
    </Container>
  );
};

export default App;
