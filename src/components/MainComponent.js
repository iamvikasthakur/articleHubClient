import React, { useState, useEffect } from "react";
import Navbarr from "./Navbar";
import Footer from "./Footer";
import {
  Route,
  Redirect,
  Switch,
  useHistory,
  useParams,
} from "react-router-dom";
import MainJumbotron from "./jumbotrons/MainJumbotron";
import EcoJumbotron from "./jumbotrons/EcoJumbotron";
import TechJumbotron from "./jumbotrons/TechJumbotron";
import SportJumbotron from "./jumbotrons/SportJumbotron";
import SciJumbotron from "./jumbotrons/SciJumbotron";
import Article from "./Article";
import Write from "./Write";
import Cardd from "./Card";
import HomeCard from "./HomeCard";
import firebase from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import "firebase/auth";
import axios from "../axios";

firebase.initializeApp(firebaseConfig);
const Main = () => {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(() => firebase.auth.currentUser);

  const history = useHistory();

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().useDeviceLanguage();
    try {
      await firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          authenticate(result.credential.idToken, result.user);
        });
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        setUser(user);
        localStorage.setItem("email", user.email);
        localStorage.setItem("accessToken", user.za);
        localStorage.setItem("name", user.displayName);
        updateAuthenticate(user.za, user.email);
      } else {
        setUser(false);
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      setUser(false);
      localStorage.removeItem("email");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("name");
      history.push("/");
      console.log("signing out");
    } catch (error) {
      console.log(error.message);
    }
  };

  const authenticate = (idToken, user) => {
    const userData = {
      name: user.displayName,
      photoUrl: user.photoURL,
      accessToken: user.za,
      email: user.email,
    };
    // console.log(userData);
    // console.log(idToken);
    axios
      .post("/authenticate", { idToken: idToken, userData: userData })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  const updateAuthenticate = (accessToken, email) => {
    // console.log(email);
    axios
      .post("/authenticate/update", { accessToken: accessToken, email: email })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  const Home = () => {
    return (
      <>
        <MainJumbotron />
        <HomeCard />
      </>
    );
  };

  const Eco = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      axios
        .get("/economical")
        .then((articles) => {
          setData(articles.data);
          setIsLoading(false);
          console.log(articles.data);
        })
        .catch((err) => console.log(err));
    }, []);

    if(isLoading) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <>
        <EcoJumbotron />
        <Cardd data={data} topic={"economical"} />
      </>
    );
  };

  const Tech = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      axios
        .get("/technical")
        .then((articles) => {
          setData(articles.data);
          setIsLoading(false);
          // console.log(articles.data);
        })
        .catch((err) => console.log(err));
    }, []);

    if(isLoading) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <>
        <TechJumbotron />
        <Cardd data={data} topic={"technical"} />
      </>
    );
  };

  const Sport = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      axios
        .get("/sport")
        .then((articles) => {
          setData(articles.data);
          setIsLoading(false);
          // console.log(articles.data);
        })
        .catch((err) => console.log(err));
    }, []);

    if (isLoading) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <>
        <SportJumbotron />
        <Cardd data={data} topic={"sport"} />
      </>
    );
  };

  const Sci = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      axios
        .get("/science")
        .then((articles) => {
          setData(articles.data);
          setIsLoading(false);
        })
        .catch((err) => console.log(err));
    }, []);

    if (isLoading) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <>
        <SciJumbotron />
        <Cardd data={data} topic={"science"} />
      </>
    );
  };

  const Add = () => {
    return (
      <>
        {user && (
          <Write
            email={localStorage.getItem("email")}
            author={localStorage.getItem("name")}
            accessToken={localStorage.getItem("accessToken")}
          />
        )}
      </>
    );
  };

  const DetailedCard = () => {
    const [article, setArticle] = useState();
    const { topic, id } = useParams();
    const [alreadyLiked, setAlreadyLiked] = useState(false);
    const [alreadyDisliked, setAlreadyDisliked] = useState(false);
    const [isLoading1, setIsLoading1] = useState(true);
    const [isLoading2, setIsLoading2] = useState(true);
    console.log(topic, id, article);

    useEffect(() => {
      console.log("inside useeffect");
      const email = localStorage.getItem("email");
      const accessToken = localStorage.getItem("accessToken");

      const config = {
        headers: {
            email : email,
            accessToken : accessToken
        }
      };

      axios
        .get(`/${topic}/${id}`, config)
        .then((response) => {
          setArticle(response.data);
          console.log(response.data);
          setIsLoading1(false)
        })
        .catch((err) => console.log(err));

      if (email) {
        axios
          .get(`user/${email}`, config)
          .then((response) => {
            if (response) {
              console.log(response.data);
              setAlreadyLiked(response.data[0].likedArticleId.includes(id));
              setAlreadyDisliked(response.data[0].dislikedArticleId.includes(id));
              setIsLoading2(false);
              // console.log(alreadyLiked, alreadyDisliked);
            }
          })
          .catch((err) => console.log(err));
      }
    }, []);

    if (isLoading1 || isLoading2) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <Article
        article={article}
        alreadyLiked={alreadyLiked}
        alreadyDisliked={alreadyDisliked}
        setAlreadyDisliked={setAlreadyDisliked}
        setAlreadyLiked={setAlreadyLiked}
        topic={topic}
        email={localStorage.getItem("email")}
      />
    );
  };

  return (
    <div>
      <Navbarr
        user={user}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
      />
      <Switch history={history}>
        <Route exact path="/" component={Home} />
        <Route exact path="/economical" component={Eco} />
        <Route exact path="/technical" component={Tech} />
        <Route exact path="/sport" component={Sport} />
        <Route exact path="/science" component={Sci} />
        <Route exact path="/write" component={Add} />
        <Route exact path="/:topic/:heading/:id" component={DetailedCard} />
        <Redirect to="/" />
      </Switch>
      <Footer />
    </div>
  );
};

export default Main;
