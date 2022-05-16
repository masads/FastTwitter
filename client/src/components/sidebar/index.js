import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { SideBarBox, Header, Users, UserFlex, Button } from "../styles/sidebar";
import Loading from "../loading";
import { SET_UPDATE } from "../../redux/actions";
import laptop from '../../../public/laptop.png'
import food from '../../../public/food.png'
import games from '../../../public/games.png'
import watch from '../../../public/watch.png'
import clothes from '../../../public/clothes.png'
const URL = process.env.REACT_APP_SERVER_URL;
import { Image } from 'antd';
const SideBar = () => {
  const [ad,setAd]=useState(laptop)
  const [whoFollow, setWhoFollow] = useState(null);
  const [isFollowDisabled, setFollowDisabled] = useState(false);

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const userId = user.id;
  const token = user.token;
  const refresh = useSelector((state) => state.update.refresh);
  const dispatch = useDispatch();

  useEffect(() => {

    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    (async () => {
      try {
        const res = await axios.get(`${URL}/feed/who-follow?userId=${userId}`, {
          cancelToken: source.token,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const adsData = await axios.get(`${URL}/tweet/get-adsdata?userId=${userId}`);
        console.log(adsData.data.adsData)
        let adsCount = [{"type":"clothes","count":adsData.data.adsData.clothestweetcount},{"type":"food","count":adsData.data.adsData.foodtweetcount},{"type":"games","count":adsData.data.adsData.gamestweetcount},{"type":"laptop","count":adsData.data.adsData.laptoptweetcount},{"type":"watch","count":adsData.data.adsData.watchtweetcount}]
        let max=0
        for(let i of adsCount)
        {
          if(max<i.count)
          { 
            if(i.type=="watch")
            {
              setAd(watch)
            }else if(i.type=="food")
            {
              setAd(food)
            }else if(i.type=="clothes")
            {
              setAd(clothes)
            }else if(i.type=="games")
            {
              setAd(games)
            }else if(i.type=="laptop")
            {
              setAd(laptop)
            }
            max=parseInt(i.count)
          }
        }
        setWhoFollow(res.data.whoFollow);
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      source.cancel();
    };
  }, [refresh]);

  const handleFollow = async (e, idx) => {
    e.preventDefault();
    setFollowDisabled(true);
    await axios.post(
      `${URL}/follow`,
      {
        followedId: whoFollow[idx].id,
        followerId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const res = await axios.get(`${URL}/feed/who-follow?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setWhoFollow(res.data.whoFollow);
    setFollowDisabled(false);
    dispatch({ type: SET_UPDATE });
  };

  if (!whoFollow) return <Loading />;

  return (
    <>
    <SideBarBox tweetHov={theme.tweetHov}>
      <Header color={theme.color} border={theme.border}>
        <h2>Who to follow</h2>
      </Header>
      <Users>
        {!whoFollow.length && (
          <p style={{ textAlign: "center", color: theme.color }}>
            No more users left to follow
          </p>
        )}
        {whoFollow.map((user, idx) => (
          <Link to={`/profile/${user.username}`} key={user.id}>
            <UserFlex color={theme.color} border={theme.border}>
              <img src={user.avatar} />
              <div>
                <h3>
                  {user.firstname} {user.lastname}
                </h3>
                <p>@{user.username}</p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Button
                  onClick={(e) => handleFollow(e, idx)}
                  disabled={isFollowDisabled}
                >
                  Follow
                </Button>
              </div>
            </UserFlex>
          </Link>
        ))}
      </Users>
    </SideBarBox>
    <SideBarBox tweetHov={theme.tweetHov}>
      <Header color={theme.color} border={theme.border}>
        <h2>AD</h2>
      </Header>
      <div>
          <Image
          src={ad}
        />
      </div>
      <p style={{ textAlign: "center", color: theme.color ,height:30}}>
      </p>
    </SideBarBox>
    </>
  );
};

export default SideBar;
