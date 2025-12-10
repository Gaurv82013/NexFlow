export function gatAvatar(userPicture: string | null, userEmail: string) {
    return userPicture ?? `https://avatar.vercel.sh/${userEmail}`;
}


