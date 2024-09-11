import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import Actions from "../components/Actions";
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import postsAtom from "../atoms/postsAtom";

// Lista de usernames para os quais o ícone de verificação deve ser exibido
const VERIFIED_USERNAMES = ['luischavoso.7'];

const PostPage = () => {
    const { user, loading } = useGetUserProfile();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const showToast = useShowToast();
    const { pid } = useParams();
    const currentUser = useRecoilValue(userAtom);
    const navigate = useNavigate();

    const currentPost = posts.find(post => post._id === pid); // Obtém o post atual pela ID

    useEffect(() => {
        const getPost = async () => {
            try {
                const res = await fetch(`/api/posts/${pid}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setPosts([data]);
            } catch (error) {
                showToast("Error", error.message, "error");
            }
        };
        getPost();
    }, [showToast, pid, setPosts]);

    const handleDeletePost = async () => {
        try {
            if (!window.confirm("Are you sure you want to delete this post?")) return;

            const res = await fetch(`/api/posts/${currentPost._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Post deleted", "success");
            navigate(`/${user.username}`);
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    if (loading) {
        return (
            <Flex justifyContent={"center"} mt={10}>
                <Spinner size={"xl"} />
            </Flex>
        );
    }

    if (!currentPost) return null;

    const isVerified = VERIFIED_USERNAMES.includes(currentPost.username);

    return (
        <Box maxW="container.md" mx="auto" p={4}>
            <Flex direction="column" gap={4}>
                <Flex alignItems="center" gap={3}>
                    <Avatar src={currentPost.userProfilePic || user.profilePic} size={"md"} name={currentPost.username} />
                    <Flex direction="column">
                        <Text fontSize={"sm"} fontWeight={"bold"}>
                            {currentPost.username}
                        </Text>
                        {isVerified && (
                            <Image src='/verified.png' w='4' h={4} ml={2} />
                        )}
                    </Flex>
                </Flex>
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize={"xs"} color={"gray.500"}>
                        {formatDistanceToNow(new Date(currentPost.createdAt))} atrás
                    </Text>
                    {currentUser?._id === currentPost.userId && (
                        <DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost} />
                    )}
                </Flex>
                <Text my={3}>{currentPost.text}</Text>
                {currentPost.img && (
                    <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.200"}>
                        <Image src={currentPost.img} w={"full"} />
                    </Box>
                )}
                <Flex gap={3} my={3}>
                    <Actions post={currentPost} />
                </Flex>
                <Divider my={4} />
                <Flex justifyContent={"space-between"} alignItems="center">
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"2xl"}>👋</Text>
                        <Text color={"gray.500"}>Get the app to like, reply and post.</Text>
                    </Flex>
                    <Button>Get</Button>
                </Flex>
                <Divider my={4} />
                {currentPost.replies.length > 0 ? (
                    currentPost.replies.map((reply) => (
                        <Comment
                            key={reply._id}
                            reply={reply}
                            lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
                        />
                    ))
                ) : (
                    <Text color="gray.500">No replies yet</Text>
                )}
            </Flex>
        </Box>
    );
};

export default PostPage;
