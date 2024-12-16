import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDates } from "../common/date";
import NotificationCommentField from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCard = ({ data, index, notificationState }) => {

    let [isReplying, setReplying] = useState(false);
    let { type, seen, reply, createdAt, comment, replied_on_comment, user, user: { personal_info: { fullname, username, profile_img } }, blog: { _id, blog_id, title }, _id: notification_id } = data;
    let { userAuth: { username: author_username, profile_img: author_profile_img, fullname: author_fullname, access_token } } = useContext(UserContext);
    let { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

    const handleReplyClick = () => {
        setReplying(preVal => !preVal)
    }

    const handleDelete = (comment_id, type, target) => {
        target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id: comment_id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                if (type == 'comment') {
                    results.splice(index, 1);
                }
                else {
                    delete results[index].reply;
                }

                target.removeAttribute("disabled");
                setNotifications({ ...notifications, results, totalDocs: totalDocs - 1, deleteDocCount: notifications.deleteDocCount + 1 });
            })
            .catch(err => {
                console.log(err);
            })
    }

    return (
        <div className={"p-6 border-b border-grey border-l-black " + (!seen ? "border-l-2" : "")}>
            <div className="flex gap-5 mb-3">
                <img src={profile_img} className="w-14 h-14 flex-none rounded-full" />
                <div className="w-full">
                    <h1 className="font-medium text-xl text-dark-grey flex gap-1">
                        <span className="lg:inline-block hidden capitalize">{fullname}</span>
                        <Link to={`/user/${username}`} className="mx-1 text-black hover:underline">@{username}</Link>
                        <span className="font-normal">
                            {
                                type == 'like' ? "Liked Your Blog" :
                                    type == 'comment' ? "Commented On" : "Replied On"

                            }
                        </span>
                    </h1>

                    {type == "reply" ? (
                        <div className="p-4 mt-4 rounded-md bg-grey">
                            <p>{replied_on_comment.comment}</p>
                        </div>
                    ) : (
                        <Link to={`/blog/${blog_id}`} className="font-medium text-dark-grey hover:underline line-clamp-1">{`"${title}"`}</Link>
                    )
                    }

                </div>
            </div>

            {type != 'like' ? (
                <p className="ml-14 pl-5 font-gelasio text-xl my-5">{comment.comment}</p>
            ) : ("")
            }

            <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">

                <p>{getDates(createdAt)}</p>

                {type != 'like' ? <>

                    {!reply ? <button className="hover:text-black hover:underline" onClick={handleReplyClick}>Reply</button> : ""

                    }
                    <button className="hover:text-black hover:underline" onClick={(e) => handleDelete(comment._id, "comment", e.target)}>Delete</button>
                </> : ""

                }

            </div>

            {isReplying ? (
                <div className="mt-8">
                    <NotificationCommentField _id={_id} blog_author={user} index={index} replyingTo={comment._id} setReplying={setReplying} notification_id={notification_id} notificationData={notificationState} />
                </div>
            ) : ("")

            }

            {reply ? (
                <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
                    <div className="flex gap-3 mb-3">
                        <img src={author_profile_img} className="w-10 h-10 rounded-full" />
                        <div>
                            <h1>
                                <Link to={`/user/${author_username}`} className="mx-1 text-black hover:underline">@{author_username}</Link>
                                <span className="font-normal">Replied To</span>
                                <Link to={`/user/${username}`} className="mx-1 text-black hover:underline">@{username}</Link>
                            </h1>
                        </div>
                    </div>
                    <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
                    <button className="hover:text-black hover:underline ml-14 mt-2" onClick={(e) => handleDelete(comment._id, "reply", e.target)}>Delete</button>
                </div>
            ) : ("")

            }

        </div>
    )
}

export default NotificationCard;